import { CommunityManager } from "@/components/admin/CommunityManager";
import { Card } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gestão da Comunidade" };

export default function ComunidadeAdminPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Gestão da Comunidade</h1>
        <p className="mt-1 text-sm text-ink-500">
          Modere mensagens, responda a clientes e acompanhe a atividade da comunidade.
        </p>
      </div>

      <CommunityManager />

      <div className="mt-8 grid md:grid-cols-2 gap-5">
        <Card className="p-6 rounded-2xl">
          <h2 className="font-semibold text-ink-900 text-lg">Ações rápidas</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 bg-ink-50 rounded-xl">
              <div>
                <p className="font-medium text-ink-900">Exportar relatório</p>
                <p className="text-xs text-ink-500">CSV com todas as mensagens e métricas</p>
              </div>
              <span className="px-2 py-1 text-xs bg-brand-100 text-brand-700 rounded-full">Breve</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-ink-50 rounded-xl">
              <div>
                <p className="font-medium text-ink-900">Configurar moderação automática</p>
                <p className="text-xs text-ink-500">Palavras-chave, spam, links suspeitos</p>
              </div>
              <span className="px-2 py-1 text-xs bg-brand-100 text-brand-700 rounded-full">Breve</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-ink-50 rounded-xl">
              <div>
                <p className="font-medium text-ink-900">Notificações por email</p>
                <p className="text-xs text-ink-500">Receba alertas de mensagens reportadas</p>
              </div>
              <span className="px-2 py-1 text-xs bg-brand-100 text-brand-700 rounded-full">Breve</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}