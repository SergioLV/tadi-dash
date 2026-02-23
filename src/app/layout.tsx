import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elige un Plan - Admin",
  description: "Panel de administración de Elige un Plan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
