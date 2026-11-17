"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3x3, Link2, Package, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

export function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  // Não exibir em rotas de administração
  if (pathname.startsWith("/admin")) return null;

  const items = [
    {
      label: "Início",
      href: "/",
      icon: Home,
      active: pathname === "/",
    },
    {
      label: "Catálogo",
      href: "/produtos",
      icon: Grid3x3,
      active: pathname.startsWith("/produtos") || pathname.startsWith("/produto/"),
    },
    {
      label: "Colar Link",
      href: "/importar",
      icon: Link2,
      active: pathname.startsWith("/importar"),
      highlight: true,
    },
    {
      label: "Pedidos",
      href: "/pedidos",
      icon: Package,
      active: pathname.startsWith("/pedidos") || pathname.startsWith("/rastrear") || pathname.startsWith("/pedido/"),
    },
    {
      label: "Suporte",
      href: "https://wa.me/244922058136?text=Ol%C3%A1%20ImportEasy!%20Preciso%20de%20ajuda%20com%20uma%20encomenda.",
      icon: MessageCircle,
      active: false,
      external: true,
      color: "text-emerald-600",
    },
  ];

  return (
    <nav
      aria-label="Navegação móvel"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-ink-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] px-2 py-1.5 transition-transform"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-4 group focus:outline-none"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95",
                    item.active
                      ? "bg-brand-700 text-white shadow-brand-600/40 ring-4 ring-brand-100"
                      : "bg-brand-600 text-white shadow-brand-500/30 group-hover:bg-brand-700"
                  )}
                >
                  <Icon className="w-5 h-5 stroke-[2.4]" />
                </div>
                <span className="text-[10px] font-bold text-brand-700 mt-1">
                  {item.label}
                </span>
              </Link>
            );
          }

          if (item.external) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-ink-500 hover:text-ink-900 active:scale-95 transition"
              >
                <div className="relative">
                  <Icon className={cn("w-5 h-5", item.color || "text-ink-600")} />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <span className="text-[10px] font-medium mt-1 text-ink-600">
                  {item.label}
                </span>
              </a>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition active:scale-95",
                item.active ? "text-brand-600 font-bold" : "text-ink-500 hover:text-ink-900"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5", item.active ? "stroke-[2.4]" : "stroke-[1.8]")} />
                {item.label === "Pedidos" && itemCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-extrabold grid place-items-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] mt-1", item.active ? "font-bold text-brand-600" : "font-medium text-ink-600")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
