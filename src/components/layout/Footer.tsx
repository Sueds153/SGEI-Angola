import Link from "next/link";
import { MessageCircle, Mail, MapPin, Phone, Send, Shield, Truck, CreditCard } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Marquee } from "@/components/motion";

export function Footer() {
  return (
    <footer className="mt-24 bg-ink-950 text-ink-300">
      {/* Marquee */}
      <div className="border-b border-ink-800 py-6 overflow-hidden">
        <Marquee duration={35}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="text-white/60 text-lg md:text-2xl font-medium tracking-tight flex items-center gap-10"
            >
              <span>ImportEasy — Sua ponte para o mundo</span>
              <span className="text-brand-500">◆</span>
              <span>Shein • AliExpress • Vinted para Angola</span>
              <span className="text-brand-500">◆</span>
              <span>Pague em Kz • Entrega na porta</span>
              <span className="text-brand-500">◆</span>
            </div>
          ))}
        </Marquee>
      </div>

      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 pt-20 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Logo variant="light" size="md" showTagline />
            <p className="mt-5 text-sm leading-relaxed text-ink-400 max-w-xs">
              Importamos da Shein, AliExpress e Vinted para Angola. Preços em Kwanzas, sem cartão internacional, entrega na sua porta.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <a
                href="https://wa.me/244922058136"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-ink-800 hover:bg-brand-600 text-white grid place-items-center transition"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="mailto:apoio@importeasy.ao"
                className="h-10 w-10 rounded-full bg-ink-800 hover:bg-brand-600 text-white grid place-items-center transition"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Importar</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/produtos" className="hover:text-white transition">Produtos em destaque</Link></li>
              <li><Link href="/importar" className="hover:text-white transition">Simular importação</Link></li>
              <li><Link href="/rastrear" className="hover:text-white transition">Rastrear pedido</Link></li>
              <li><Link href="/comunidade" className="hover:text-white transition">Comunidade</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Apoio</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/como-funciona" className="hover:text-white transition">Como funciona</Link></li>
              <li><Link href="/ajuda" className="hover:text-white transition">Perguntas frequentes</Link></li>
              <li><Link href="/ajuda#pagamento" className="hover:text-white transition">Formas de pagamento</Link></li>
              <li><Link href="/ajuda#entrega" className="hover:text-white transition">Prazos de entrega</Link></li>
              <li><Link href="/ajuda#alfandega" className="hover:text-white transition">Alfândega e taxas</Link></li>
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

        {/* Trust badges */}
        <div className="mt-12 pt-8 border-t border-ink-800">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-8">
            <div className="flex items-center gap-2 text-sm text-ink-400">
              <Shield className="w-5 h-5 text-brand-500" />
              <span>Sem surpresas na alfândega</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-400">
              <CreditCard className="w-5 h-5 text-brand-500" />
              <span>Pague em Kz (Multicaixa/Transferência)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-400">
              <Truck className="w-5 h-5 text-brand-500" />
              <span>Entrega em Luanda e províncias</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-ink-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-ink-500">
          <p>
            © {new Date().getFullYear()} ImportEasy. Intermediação de compras Shein, AliExpress e Vinted para Angola. Não somos afiliados oficialmente a nenhuma plataforma.
          </p>
          <div className="flex gap-5">
            <Link href="/ajuda#termos" className="hover:text-white transition">Termos</Link>
            <Link href="/ajuda#privacidade" className="hover:text-white transition">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}