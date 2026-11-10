"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function AdminNavLinkClient({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      data-active={active ? "true" : "false"}
      className={cn(
        "admin-nav-link inline-flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition whitespace-nowrap",
        active
          ? "bg-white text-black"
          : "text-ink-300 hover:bg-ink-800 hover:text-white"
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="nav-label">{children}</span>
    </Link>
  );
}
