"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { AuthProvider } from "@/components/AuthProvider";
import Sidebar from "@/components/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-pulse text-medium">Cargando...</div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-surface">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile header */}
          <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray shadow-sm">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-dark text-xl p-1"
              aria-label="Abrir menú"
            >
              ☰
            </button>
            <img src="/eligeunplan/eligeunplan.webp" alt="Elige un Plan" className="h-7 w-auto" />
            <div className="w-8" />
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
