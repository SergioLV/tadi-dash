"use client";

import { useEffect, useState, useMemo } from "react";
import { format, parseISO, isWithinInterval } from "date-fns";
import { fetchVisits } from "@/lib/api";
import { Visit } from "@/lib/types";
import { exportToCSV } from "@/lib/csv";

const PAGE_SIZE = 20;

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchVisits().then((v) => {
      setVisits(v.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return visits.filter((v) => {
      if (search) {
        const s = search.toLowerCase();
        const match =
          (v.browser?.toLowerCase().includes(s)) ||
          (v.os?.toLowerCase().includes(s)) ||
          (v.referrer?.toLowerCase().includes(s)) ||
          (v.ip?.toLowerCase().includes(s));
        if (!match) return false;
      }
      if (dateFrom || dateTo) {
        try {
          const d = parseISO(v.timestamp);
          if (dateFrom && dateTo) {
            return isWithinInterval(d, { start: parseISO(dateFrom), end: parseISO(dateTo + "T23:59:59") });
          }
          if (dateFrom) return d >= parseISO(dateFrom);
          if (dateTo) return d <= parseISO(dateTo + "T23:59:59");
        } catch { return true; }
      }
      return true;
    });
  }, [visits, search, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExport = () => {
    exportToCSV(
      filtered.map((v) => ({
        timestamp: v.timestamp,
        browser: v.browser || "",
        os: v.os || "",
        referrer: v.referrer || "",
        screenSize: `${v.screenWidth}x${v.screenHeight}`,
        language: v.language || "",
        timezone: v.timezone || "",
        utmSource: v.utmSource || "",
        utmMedium: v.utmMedium || "",
        utmCampaign: v.utmCampaign || "",
        ip: v.ip || "",
      })),
      `visitas-${format(new Date(), "yyyy-MM-dd")}`
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-medium">Cargando visitas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-dark">Visitas</h1>
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
          placeholder="Buscar por browser, OS, referrer, IP..."
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
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {paginated.map((v, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray/50 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium text-dark">
                {(() => { try { return format(parseISO(v.timestamp), "dd/MM/yy HH:mm"); } catch { return v.timestamp; } })()}
              </span>
              <span className="text-xs text-light">{v.ip || "—"}</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span className="text-light">Browser</span><span className="text-dark">{v.browser}</span>
              <span className="text-light">OS</span><span className="text-dark">{v.os}</span>
              <span className="text-light">Referrer</span><span className="text-dark truncate">{v.referrer || "—"}</span>
              <span className="text-light">Pantalla</span><span className="text-dark">{v.screenWidth}×{v.screenHeight}</span>
              <span className="text-light">Idioma</span><span className="text-dark">{v.language}</span>
              <span className="text-light">UTM</span><span className="text-dark">{v.utmSource || "—"}</span>
            </div>
          </div>
        ))}
        {paginated.length === 0 && (
          <div className="text-center py-8 text-light text-sm">No se encontraron visitas</div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface text-left text-light">
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Browser</th>
                <th className="px-4 py-3 font-medium">OS</th>
                <th className="px-4 py-3 font-medium">Referrer</th>
                <th className="px-4 py-3 font-medium">Pantalla</th>
                <th className="px-4 py-3 font-medium">Idioma</th>
                <th className="px-4 py-3 font-medium">Zona</th>
                <th className="px-4 py-3 font-medium">UTM</th>
                <th className="px-4 py-3 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((v, i) => (
                <tr key={i} className="border-t border-gray/30 hover:bg-surface/50">
                  <td className="px-4 py-3 text-dark whitespace-nowrap">
                    {(() => { try { return format(parseISO(v.timestamp), "dd/MM/yy HH:mm"); } catch { return v.timestamp; } })()}
                  </td>
                  <td className="px-4 py-3 text-dark">{v.browser}</td>
                  <td className="px-4 py-3 text-dark">{v.os}</td>
                  <td className="px-4 py-3 text-dark truncate max-w-[150px]">{v.referrer || "—"}</td>
                  <td className="px-4 py-3 text-dark whitespace-nowrap">{v.screenWidth}×{v.screenHeight}</td>
                  <td className="px-4 py-3 text-dark">{v.language}</td>
                  <td className="px-4 py-3 text-dark">{v.timezone}</td>
                  <td className="px-4 py-3 text-dark text-xs">{v.utmSource || "—"}</td>
                  <td className="px-4 py-3 text-dark">{v.ip || "—"}</td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-light">No se encontraron visitas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-medium">{filtered.length} visitas encontradas</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray text-sm disabled:opacity-40 hover:bg-surface transition"
            >
              Anterior
            </button>
            <span className="px-3 py-1.5 text-sm text-medium">
              {page} / {totalPages}
            </span>
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
    </div>
  );
}
