"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/visits", label: "Visitas", icon: "👁️" },
  { href: "/admin/leads", label: "Leads", icon: "📋" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-gray min-h-screen flex flex-col shadow-sm">
      <div className="p-6 border-b border-gray">
        <Link href="/admin" className="flex items-center gap-3">
          <img src="/eligeunplan/eligeunplan.webp" alt="Elige un Plan" className="h-8 w-auto" />
          <span className="font-semibold text-dark text-sm">Admin Panel</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary-dark"
                  : "text-medium hover:bg-surface hover:text-dark"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-medium hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <span>🚪</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
