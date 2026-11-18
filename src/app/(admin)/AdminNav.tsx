"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  CreditCard,
  Truck,
  Tags,
  Settings,
  FileText,
  BarChart3,
  MessageSquare,
  Banknote,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/rastreio", label: "Rastreio & Intervenção", icon: Search },
  { href: "/admin/cambio", label: "Câmbio Informal", icon: Banknote },
  { href: "/admin/pagamentos", label: "Pagamentos", icon: CreditCard },
  { href: "/admin/logistica", label: "Logística", icon: Truck },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/precos", label: "Preços & Margens", icon: BarChart3 },
  { href: "/admin/comunidade", label: "Comunidade", icon: MessageSquare },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
  { href: "/admin/logs", label: "Logs", icon: FileText },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex lg:flex-col gap-0.5 p-2 overflow-x-auto lg:overflow-visible no-scrollbar">
      {adminNav.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            data-active={active ? "true" : "false"}
            className={cn(
              "admin-nav-link inline-flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition whitespace-nowrap",
              active
                ? "bg-white text-black"
                : "text-ink-300 hover:bg-ink-800 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default AdminNav;
