"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="mt-24 bg-ink-950 text-ink-300">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 pt-14 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Logo variant="light" size="md" showTagline />
            <p className="mt-5 text-sm leading-relaxed text-ink-400 max-w-xs">
              Ajudamos a comprar em lojas internacionais, com pagamento em Kwanzas e entrega em Angola.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <a
                href="https://wa.me/244922058136"
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 w-11 rounded-full bg-ink-800 hover:bg-brand-600 text-white grid place-items-center transition"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="mailto:apoio@importeasy.ao"
                className="h-11 w-11 rounded-full bg-ink-800 hover:bg-brand-600 text-white grid place-items-center transition"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Importar</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/produtos" className="inline-flex min-h-11 items-center hover:text-white transition">Produtos em destaque</Link></li>
              <li><Link href="/importar" className="inline-flex min-h-11 items-center hover:text-white transition">Simular importação</Link></li>
              <li><Link href="/rastrear" className="inline-flex min-h-11 items-center hover:text-white transition">Rastrear pedido</Link></li>
              <li><Link href="/comunidade" className="inline-flex min-h-11 items-center hover:text-white transition">Comunidade</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Apoio</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/como-funciona" className="inline-flex min-h-11 items-center hover:text-white transition">Como funciona</Link></li>
              <li><Link href="/ajuda" className="inline-flex min-h-11 items-center hover:text-white transition">Perguntas frequentes</Link></li>
              <li><Link href="/ajuda#pagamento" className="inline-flex min-h-11 items-center hover:text-white transition">Formas de pagamento</Link></li>
              <li><Link href="/ajuda#entrega" className="inline-flex min-h-11 items-center hover:text-white transition">Prazos de entrega</Link></li>
              <li><Link href="/ajuda#alfandega" className="inline-flex min-h-11 items-center hover:text-white transition">Alfândega e taxas</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-ink-500" />
                <span>+244 922 058 136</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-ink-500" />
                <span>apoio@importeasy.ao</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-ink-500" />
                <span>Luanda, Angola</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-ink-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-ink-500">
          <p>
            © {new Date().getFullYear()} ImportEasy. Intermediação de compras Shein, AliExpress e Vinted para Angola. Não somos afiliados oficialmente a nenhuma plataforma.
          </p>
          <div className="flex gap-5">
            <Link href="/termos" className="hover:text-white transition">Termos e Condições</Link>
            <Link href="/privacidade" className="hover:text-white transition">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
