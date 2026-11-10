import Link from "next/link";
import { MessageCircle, Mail, MapPin, Phone, Send } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Marquee } from "@/components/motion";

export function Footer() {
  return (
    <footer className="mt-24 bg-black text-ink-300">
      {/* Marquee */}
      <div className="border-b border-ink-800 py-6 overflow-hidden">
        <Marquee duration={35}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="text-white/60 text-lg md:text-2xl font-medium tracking-tight flex items-center gap-10"
            >
              <span>Encomenda da SHEIN</span>
              <span className="text-primary-500">●</span>
              <span>Entrega em Angola</span>
              <span className="text-primary-500">●</span>
              <span>Pagamento em Kz</span>
              <span className="text-primary-500">●</span>
              <span>Acompanhamento em tempo real</span>
              <span className="text-primary-500">●</span>
            </div>
          ))}
        </Marquee>
      </div>

      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 pt-20 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Logo variant="light" size="md" showTagline />
            <p className="mt-5 text-sm leading-relaxed text-ink-400 max-w-xs">
              Encontra o que queres. Nós tratamos da compra, envio e entrega em Angola.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <a
                href="https://wa.me/244923000000"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-ink-800 hover:bg-primary-600 text-white grid place-items-center transition"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="mailto:apoio@sgei.ao"
                className="h-10 w-10 rounded-full bg-ink-800 hover:bg-primary-600 text-white grid place-items-center transition"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Comprar</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/catalogo" className="hover:text-white transition">Catálogo</Link></li>
              <li><Link href="/categoria/vestuario-feminino" className="hover:text-white transition">Feminino</Link></li>
              <li><Link href="/categoria/vestuario-masculino" className="hover:text-white transition">Masculino</Link></li>
              <li><Link href="/categoria/calcados" className="hover:text-white transition">Calçados</Link></li>
              <li><Link href="/categoria/bolsas" className="hover:text-white transition">Bolsas</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Apoio</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/como-funciona" className="hover:text-white transition">Como funciona</Link></li>
              <li><Link href="/ajuda" className="hover:text-white transition">FAQ</Link></li>
              <li><Link href="/pedidos" className="hover:text-white transition">Rastrear pedido</Link></li>
              <li><Link href="/conta" className="hover:text-white transition">A minha conta</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-ink-500" />
                <span>+244 923 000 000</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-ink-500" />
                <span>apoio@sgei.ao</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-ink-500" />
                <span>Luanda, Angola</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-ink-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-ink-500">
          <p>
            © {new Date().getFullYear()} SGEI. Intermediação de compras SHEIN para Angola. Não somos afiliados oficialmente à SHEIN.
          </p>
          <div className="flex gap-5">
            <Link href="/ajuda" className="hover:text-white transition">Termos</Link>
            <Link href="/ajuda" className="hover:text-white transition">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
