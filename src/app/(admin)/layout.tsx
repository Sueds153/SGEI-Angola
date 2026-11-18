import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, Shield } from "lucide-react";
import { getSession } from "@/lib/auth";
import { Logo } from "@/components/brand/Logo";
import { AdminNav } from "./AdminNav";

export const metadata: Metadata = {
  title: "Admin — ImportEasy",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Verifica autenticação - se não admin, redireciona para login
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="admin-shell min-h-screen bg-ink-50 flex flex-col lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="admin-sidebar bg-black text-white flex flex-col lg:min-h-screen lg:sticky lg:top-0">
        <div className="p-4 border-b border-ink-800 flex items-center justify-between lg:block">
          <Logo variant="light" size="sm" href="/admin" showTagline />
          <Link
            href="/"
            className="lg:hidden inline-flex h-9 items-center gap-1.5 rounded-full bg-white/5 px-3 text-[12px] font-medium text-white/80 hover:text-white"
          >
            <Shield className="h-3.5 w-3.5" />
            Ver loja
          </Link>
        </div>

        <AdminNav />

        <div className="admin-sidebar-footer mt-auto p-3 lg:border-t lg:border-ink-800 hidden lg:block">
          <p className="px-2 py-1 text-[11px] text-ink-500">Sessão: {session.name}</p>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="w-full mt-1 inline-flex items-center gap-2 px-3 py-2 text-[13px] font-medium rounded-xl text-ink-300 hover:bg-ink-800 hover:text-white transition"
            >
              <LogOut className="h-4 w-4" /> Terminar sessão
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
