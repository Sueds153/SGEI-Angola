import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "SGEI — SHEIN direto para Angola.",
    template: "%s · SGEI",
  },
  description:
    "Encontra na SHEIN. Nós tratamos da compra e entregamos em Angola. Preços em Kz, sem cartão internacional, acompanhamento em tempo real.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "SGEI — SHEIN direto para Angola.",
    description:
      "Encontra na SHEIN. Nós tratamos da compra e entregamos em Angola.",
    type: "website",
    locale: "pt_AO",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-AO">
      <body className="min-h-screen flex flex-col bg-white text-ink-900 antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
