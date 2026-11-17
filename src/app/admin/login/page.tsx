import { Container, Card, Alert as AlertBox } from "@/components/ui";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login admin",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-white mb-8">
          <div className="h-9 w-9 rounded-lg bg-primary-600 grid place-items-center">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
              <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z"/>
            </svg>
          </div>
          <span className="font-semibold text-lg">ImportEasy</span>
        </Link>
        <Card className="p-8 rounded-3xl bg-white">
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Entrar no backoffice</h1>
          <p className="mt-1.5 text-sm text-ink-500">
            Sessão reservada a administradores da plataforma.
          </p>
          <div className="mt-7">
            <AdminLoginForm />
          </div>
          <div className="mt-6 flex items-center gap-2 p-3 rounded-xl bg-ink-50 text-xs text-ink-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <span>Área segura e restrita. Acessos registados com trilha de auditoria bancária.</span>
          </div>
        </Card>
      </div>
    </div>
  );
}