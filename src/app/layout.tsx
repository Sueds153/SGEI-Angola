import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import "./compiled.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp";
import { AdaptiveIntelligenceProvider } from "@/context/AdaptiveIntelligenceContext";

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
        <AdaptiveIntelligenceProvider>
          <CartProvider>
            <Sentry.ErrorBoundary fallback={<p>Algo deu errado. Tente recarregar a página.</p>}>
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-700 focus:px-4 focus:py-3 focus:text-white focus:shadow-lg"
              >
                Saltar para o conteúdo principal
              </a>
              <Header />
              <main id="main-content" tabIndex={-1} className="flex-1 pb-24 md:pb-0">
                {children}
              </main>
              <Footer />
              <CartDrawer />
              <BottomNav />
              <FloatingWhatsApp />
            </Sentry.ErrorBoundary>
          </CartProvider>
        </AdaptiveIntelligenceProvider>
      </body>
    </html>
  );
}
