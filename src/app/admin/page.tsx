"use client";

import { useEffect, useState } from "react";
import { format, subDays, isToday, isThisWeek, isThisMonth, parseISO } from "date-fns";
import { fetchVisits, fetchLeads } from "@/lib/api";
import { Visit, Lead } from "@/lib/types";
import StatCard from "@/components/StatCard";
import VisitsChart from "@/components/VisitsChart";
import LeadsChart from "@/components/LeadsChart";

function countByPeriod(items: { timestamp: string }[]) {
  let today = 0, week = 0, month = 0;
  items.forEach((item) => {
    try {
      const d = parseISO(item.timestamp);
      if (isToday(d)) today++;
      if (isThisWeek(d)) week++;
      if (isThisMonth(d)) month++;
    } catch { /* skip invalid dates */ }
  });
  return { today, week, month };
}

function getLast30DaysCounts(items: { timestamp: string }[]) {
  const counts: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    counts[format(subDays(new Date(), i), "MM/dd")] = 0;
  }
  items.forEach((item) => {
    try {
      const key = format(parseISO(item.timestamp), "MM/dd");
      if (key in counts) counts[key]++;
    } catch { /* skip */ }
  });
  return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

function getTopReferrers(visits: Visit[]) {
  const map: Record<string, number> = {};
  visits.forEach((v) => {
    const ref = v.referrer || "Directo";
    map[ref] = (map[ref] || 0) + 1;
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([referrer, count]) => ({ referrer, count }));
}

function getDeviceBreakdown(visits: Visit[]) {
  let mobile = 0, desktop = 0;
  visits.forEach((v) => {
    if (v.screenWidth && v.screenWidth < 768) mobile++;
    else desktop++;
  });
  return { mobile, desktop };
}

function getTopRegions(leads: Lead[]) {
  const map: Record<string, number> = {};
  leads.forEach((l) => {
    const r = l.region || "Sin región";
    map[r] = (map[r] || 0) + 1;
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([region, count]) => ({ region, count }));
}

export default function DashboardPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchVisits(), fetchLeads()]).then(([v, l]) => {
      setVisits(v);
      setLeads(l);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-medium">Cargando datos...</div>
      </div>
    );
  }

  const vStats = countByPeriod(visits);
  const lStats = countByPeriod(leads);
  const conversionRate = vStats.month > 0 ? ((lStats.month / vStats.month) * 100).toFixed(1) : "0";
  const devices = getDeviceBreakdown(visits);
  const topReferrers = getTopReferrers(visits);
  const topRegions = getTopRegions(leads);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👁️" title="Visitas hoy" value={vStats.today} subtitle={`Semana: ${vStats.week} · Mes: ${vStats.month}`} />
        <StatCard icon="📋" title="Leads hoy" value={lStats.today} subtitle={`Semana: ${lStats.week} · Mes: ${lStats.month}`} />
        <StatCard icon="📈" title="Conversión (mes)" value={`${conversionRate}%`} subtitle="Leads / Visitas" />
        <StatCard icon="📱" title="Dispositivos" value={`${devices.mobile}M / ${devices.desktop}D`} subtitle="Mobile vs Desktop" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VisitsChart data={getLast30DaysCounts(visits)} />
        <LeadsChart data={getLast30DaysCounts(leads)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray/50">
          <h3 className="text-sm font-semibold text-dark mb-4">Top Referrers</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-light">
                <th className="pb-3 font-medium">Referrer</th>
                <th className="pb-3 font-medium text-right">Visitas</th>
              </tr>
            </thead>
            <tbody>
              {topReferrers.map((r) => (
                <tr key={r.referrer} className="border-t border-gray/30">
                  <td className="py-2.5 text-dark truncate max-w-[200px]">{r.referrer}</td>
                  <td className="py-2.5 text-right font-medium text-dark">{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray/50">
          <h3 className="text-sm font-semibold text-dark mb-4">Top Regiones (Leads)</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-light">
                <th className="pb-3 font-medium">Región</th>
                <th className="pb-3 font-medium text-right">Leads</th>
              </tr>
            </thead>
            <tbody>
              {topRegions.map((r) => (
                <tr key={r.region} className="border-t border-gray/30">
                  <td className="py-2.5 text-dark">{r.region}</td>
                  <td className="py-2.5 text-right font-medium text-dark">{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
