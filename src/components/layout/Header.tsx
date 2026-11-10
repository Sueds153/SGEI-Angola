"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Menu,
  X,
  ShoppingBag,
  Package,
  MessageCircle,
  User,
  Grid3x3,
  ArrowRight,
  Globe,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";

const navItems = [
  { href: "/produtos", label: "Produtos", icon: Grid3x3 },
  { href: "/importar", label: "Importar", icon: Globe },
  { href: "/comunidade", label: "Comunidade", icon: Users },
  { href: "/rastrear", label: "Rastrear", icon: Package },
  { href: "/ajuda", label: "Ajuda", icon: MessageCircle },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) return null;

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) return;
    router.push(`/pesquisa?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/70 backdrop-saturate-150 backdrop-blur-xl border-b border-black/5"
            : "bg-white/0 border-b border-transparent"
        )}
      >
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <div className="flex h-12 md:h-[52px] items-center justify-between">
            <Logo size="md" />

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors",
                      active
                        ? "bg-ink-100 text-ink-900"
                        : "text-ink-700 hover:text-ink-900 hover:bg-ink-100/60"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Ações */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="h-9 w-9 grid place-items-center rounded-full text-ink-700 hover:bg-ink-100 transition"
                aria-label="Pesquisar"
              >
                <Search className="h-[18px] w-[18px]" />
              </button>
              <Link
                href="/pedidos"
                className="hidden sm:inline-flex h-9 items-center rounded-full px-3 text-[13px] font-medium text-ink-700 hover:bg-ink-100"
              >
                <Package className="h-[16px] w-[16px] mr-1.5" />
                Pedidos
              </Link>
              <a
                href="https://wa.me/244923000000?text=Olá"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex h-9 items-center rounded-full px-3 text-[13px] font-medium text-ink-700 hover:bg-ink-100"
              >
                <MessageCircle className="h-[16px] w-[16px] mr-1.5" />
                WhatsApp
              </a>
              <Link
                href="/conta"
                className="h-9 w-9 hidden sm:grid place-items-center rounded-full text-ink-700 hover:bg-ink-100"
                aria-label="Conta"
              >
                <User className="h-[18px] w-[18px]" />
              </Link>
              <Link
                href="/admin"
                className="hidden md:inline-flex h-9 items-center rounded-full bg-ink-900 text-white px-4 text-[13px] font-medium hover:bg-black transition"
              >
                <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                Área reservada
              </Link>
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="md:hidden h-9 w-9 grid place-items-center rounded-full text-ink-700 hover:bg-ink-100"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Painel pesquisa */}
        {searchOpen && (
          <div className="border-t border-black/5 bg-white/90 backdrop-blur-xl animate-slide-down">
            <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-4">
              <form onSubmit={onSearch} className="flex items-center gap-3">
                <Search className="h-5 w-5 text-ink-400" />
                <input
                  autoFocus
                  type="search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Procurar vestido, ténis, acessórios…"
                  className="flex-1 bg-transparent text-lg outline-none placeholder:text-ink-400 py-2"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-sm text-ink-500 hover:text-ink-900"
                >
                  Cancelar
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-white md:hidden animate-fade-in">
          <div className="flex h-14 items-center justify-between px-5 border-b border-ink-200">
            <Logo size="sm" />
            <button
              onClick={() => setMobileOpen(false)}
              className="h-9 w-9 grid place-items-center rounded-full hover:bg-ink-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="px-5 py-6 flex flex-col gap-1">
            <form onSubmit={onSearch} className="mb-4">
              <div className="flex items-center gap-2 bg-ink-100 rounded-full px-4 py-2.5">
                <Search className="h-4 w-4 text-ink-500" />
                <input
                  type="search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Pesquisar…"
                  className="flex-1 bg-transparent text-[15px] outline-none"
                />
              </div>
            </form>
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between py-4 border-b border-ink-100 text-[17px] font-medium text-ink-900 animate-slide-up"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <span className="inline-flex items-center gap-3">
                    <Icon className="h-5 w-5 text-ink-500" />
                    {item.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-ink-400" />
                </Link>
              );
            })}
            <Link
              href="/conta"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between py-4 text-[17px] font-medium text-ink-900"
            >
              <span className="inline-flex items-center gap-3">
                <User className="h-5 w-5 text-ink-500" /> Conta
              </span>
              <ArrowRight className="h-4 w-4 text-ink-400" />
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="mt-6 text-center rounded-full bg-ink-900 text-white py-3.5 font-medium text-[15px]"
            >
              Área reservada
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
