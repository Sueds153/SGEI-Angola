import { Container, Card, Alert as AlertBox } from "@/components/ui";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login admin",
};

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-white mb-8">
          <div className="h-9 w-9 rounded-lg bg-primary-600 grid place-items-center">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
              <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z"/>
            </svg>
          </div>
          <span className="font-semibold text-lg">SGEI</span>
        </Link>
        <Card className="p-8 rounded-3xl bg-white">
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Entrar no backoffice</h1>
          <p className="mt-1.5 text-sm text-ink-500">
            Sessão reservada a administradores da plataforma.
          </p>
          <div className="mt-7">
            <AdminLoginForm />
          </div>
          <div className="mt-6 p-3 rounded-xl bg-ink-50 text-xs text-ink-500">
            Demo: <code className="text-ink-900">admin@sgei.ao</code> / <code className="text-ink-900">admin123</code>
          </div>
        </Card>
      </div>
    </div>
  );
}
