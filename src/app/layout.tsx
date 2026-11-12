import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "ImportEasy — Sua ponte para o mundo",
    template: "%s · ImportEasy",
  },
  description:
    "Importe da Shein, AliExpress e Vinted para Angola. Preços em Kwanzas, sem cartão internacional, acompanhamento em tempo real.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://importeasy-angola.vercel.app"),
  openGraph: {
    title: "ImportEasy — Sua ponte para o mundo",
    description:
      "Importe da Shein, AliExpress e Vinted para Angola. Preços em Kwanzas, sem cartão internacional.",
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
        <Sentry.ErrorBoundary fallback={<p>Algo deu errado. Tente recarregar a página.</p>}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Sentry.ErrorBoundary>
      </body>
    </html>
  );
}
