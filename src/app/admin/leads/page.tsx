"use client";

import { useEffect, useState, useMemo } from "react";
import { format, parseISO, isWithinInterval } from "date-fns";
import { fetchLeads } from "@/lib/api";
import { Lead } from "@/lib/types";
import { exportToCSV } from "@/lib/csv";

const PAGE_SIZE = 20;

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterIsapre, setFilterIsapre] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [page, setPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetchLeads().then((l) => {
      setLeads(l.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setLoading(false);
    });
  }, []);

  const isapres = useMemo(() => Array.from(new Set(leads.map((l) => l.currentIsapre).filter(Boolean))).sort(), [leads]);
  const regions = useMemo(() => Array.from(new Set(leads.map((l) => l.region).filter(Boolean))).sort(), [leads]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (search) {
        const s = search.toLowerCase();
        if (!l.name?.toLowerCase().includes(s) && !l.phone?.toLowerCase().includes(s)) return false;
      }
      if (filterIsapre && l.currentIsapre !== filterIsapre) return false;
      if (filterRegion && l.region !== filterRegion) return false;
      if (dateFrom || dateTo) {
        try {
          const d = parseISO(l.timestamp);
          if (dateFrom && dateTo) return isWithinInterval(d, { start: parseISO(dateFrom), end: parseISO(dateTo + "T23:59:59") });
          if (dateFrom) return d >= parseISO(dateFrom);
          if (dateTo) return d <= parseISO(dateTo + "T23:59:59");
        } catch { return true; }
      }
      return true;
    });
  }, [leads, search, dateFrom, dateTo, filterIsapre, filterRegion]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExport = () => {
    exportToCSV(
      filtered.map((l) => ({
        nombre: l.name,
        telefono: l.phone,
        edad: l.age,
        rut: l.rut,
        cargas: l.dependents,
        isapre: l.currentIsapre,
        ingreso: l.monthlyIncome,
        region: l.region,
        motivo: l.reason,
        fecha: l.timestamp,
      })),
      `leads-${format(new Date(), "yyyy-MM-dd")}`
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-medium">Cargando leads...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-dark">Leads</h1>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-xl transition-colors w-full sm:w-auto"
        >
          Exportar CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-gray/50 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full sm:flex-1 sm:min-w-[200px] px-4 py-2.5 rounded-xl border border-gray bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={filterIsapre}
            onChange={(e) => { setFilterIsapre(e.target.value); setPage(1); }}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Todas las Isapres</option>
            {isapres.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          <select
            value={filterRegion}
            onChange={(e) => { setFilterRegion(e.target.value); setPage(1); }}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Todas las Regiones</option>
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {paginated.map((l, i) => (
          <div
            key={i}
            onClick={() => setSelectedLead(l)}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray/50 space-y-2 text-sm cursor-pointer active:bg-surface/50"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-dark">{l.name}</span>
              <span className="text-xs text-light">
                {(() => { try { return format(parseISO(l.timestamp), "dd/MM/yy"); } catch { return l.timestamp; } })()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span className="text-light">Teléfono</span><span className="text-dark">{l.phone}</span>
              <span className="text-light">Isapre</span><span className="text-dark">{l.currentIsapre}</span>
              <span className="text-light">Región</span><span className="text-dark">{l.region}</span>
              <span className="text-light">Ingreso</span><span className="text-dark">${l.monthlyIncome?.toLocaleString()}</span>
            </div>
          </div>
        ))}
        {paginated.length === 0 && (
          <div className="text-center py-8 text-light text-sm">No se encontraron leads</div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface text-left text-light">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Teléfono</th>
                <th className="px-4 py-3 font-medium">Edad</th>
                <th className="px-4 py-3 font-medium">RUT</th>
                <th className="px-4 py-3 font-medium">Cargas</th>
                <th className="px-4 py-3 font-medium">Isapre</th>
                <th className="px-4 py-3 font-medium">Ingreso</th>
                <th className="px-4 py-3 font-medium">Región</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((l, i) => (
                <tr
                  key={i}
                  onClick={() => setSelectedLead(l)}
                  className="border-t border-gray/30 hover:bg-surface/50 cursor-pointer"
                >
                  <td className="px-4 py-3 text-dark font-medium">{l.name}</td>
                  <td className="px-4 py-3 text-dark">{l.phone}</td>
                  <td className="px-4 py-3 text-dark">{l.age}</td>
                  <td className="px-4 py-3 text-dark">{l.rut}</td>
                  <td className="px-4 py-3 text-dark">{l.dependents}</td>
                  <td className="px-4 py-3 text-dark">{l.currentIsapre}</td>
                  <td className="px-4 py-3 text-dark">${l.monthlyIncome?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-dark">{l.region}</td>
                  <td className="px-4 py-3 text-dark whitespace-nowrap">
                    {(() => { try { return format(parseISO(l.timestamp), "dd/MM/yy HH:mm"); } catch { return l.timestamp; } })()}
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-light">No se encontraron leads</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-medium">{filtered.length} leads encontrados</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray text-sm disabled:opacity-40 hover:bg-surface transition"
            >
              Anterior
            </button>
            <span className="px-3 py-1.5 text-sm text-medium">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray text-sm disabled:opacity-40 hover:bg-surface transition"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedLead(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-dark">Detalle del Lead</h2>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-light hover:text-dark transition text-xl"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Nombre", selectedLead.name],
                ["Teléfono", selectedLead.phone],
                ["Edad", selectedLead.age],
                ["RUT", selectedLead.rut],
                ["Cargas", selectedLead.dependents],
                ["Isapre actual", selectedLead.currentIsapre],
                ["Ingreso mensual", `$${selectedLead.monthlyIncome?.toLocaleString()}`],
                ["Región", selectedLead.region],
                ["Motivo", selectedLead.reason],
                ["Fecha", (() => { try { return format(parseISO(selectedLead.timestamp), "dd/MM/yyyy HH:mm:ss"); } catch { return selectedLead.timestamp; } })()],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <p className="text-light font-medium mb-0.5">{label}</p>
                  <p className="text-dark">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
