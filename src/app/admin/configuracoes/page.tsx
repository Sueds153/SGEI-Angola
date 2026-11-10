import { SystemConfig } from "@/components/admin/SystemConfig";
import { Card } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Configurações" };
export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Configurações</h1>
        <p className="mt-1 text-sm text-ink-500">
          Gerencie taxas de câmbio, cache de produtos e integrações.
        </p>
      </div>

      <SystemConfig />

      <div className="mt-8 grid md:grid-cols-2 gap-5">
        <Card className="p-6 rounded-2xl">
          <h2 className="font-semibold text-ink-900 text-lg">Integrações Futuras</h2>
          <div className="mt-4 space-y-3 text-sm">
            <IntegrationRow
              title="SHEIN API"
              description="Preparado para integração oficial quando a SHEIN aprovar."
              enabled={false}
            />
            <IntegrationRow
              title="Gateway de pagamento"
              description="Pagamentos por transferência e referência (confirmação manual)."
              enabled={true}
            />
            <IntegrationRow
              title="WhatsApp Business"
              description="Suporte manual. Notificações automáticas em breve."
              enabled={false}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function IntegrationRow({ title, description, enabled }: { title: string; description: string; enabled: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-ink-100 pb-3 last:border-0 last:pb-0">
      <div>
        <p className="font-medium text-ink-900">{title}</p>
        <p className="text-xs text-ink-500 mt-0.5">{description}</p>
      </div>
      <span
        className={
          "text-[11px] font-medium px-2 py-0.5 rounded-full " +
          (enabled ? "bg-emerald-50 text-emerald-700" : "bg-ink-100 text-ink-500")
        }
      >
        {enabled ? "Ativo" : "Breve"}
      </span>
    </div>
  );
}
