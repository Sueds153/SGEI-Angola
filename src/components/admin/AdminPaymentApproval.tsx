"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, FileText, ExternalLink, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";

interface AdminPaymentApprovalProps {
  orderId: number;
  orderReference: string;
  proofUrl: string | null;
  paymentStatus: string;
  paymentMethod: string;
  paymentReference: string | null;
  amountCents: number;
}

export function AdminPaymentApproval({
  orderId,
  orderReference,
  proofUrl,
  paymentStatus,
  paymentMethod,
  paymentReference,
  amountCents,
}: AdminPaymentApprovalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAction = async (action: "approve" | "reject") => {
    setLoading(action);
    setMessage(null);

    const newPaymentStatus = action === "approve" ? "PAID" : "REJECTED";
    const newOrderStatus = action === "approve" ? "PAID" : "PENDING_PAYMENT";

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newOrderStatus,
          paymentStatus: newPaymentStatus,
        }),
      });

      if (!res.ok) {
        throw new Error("Erro ao atualizar pagamento.");
      }

      setMessage(action === "approve" ? "Pagamento aprovado com sucesso!" : "Comprovativo rejeitado.");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Erro ao processar ação.");
    } finally {
      setLoading(null);
    }
  };

  const isPdf = proofUrl?.toLowerCase().endsWith(".pdf");

  return (
    <div className="mt-4 pt-4 border-t border-ink-100 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-600 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          Comprovativo Submetido pelo Cliente
        </span>
        {paymentStatus === "REVIEW" && (
          <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full animate-pulse">
            Requer Aprovação
          </span>
        )}
      </div>

      {proofUrl ? (
        <div className="space-y-2">
          {isPdf ? (
            <div className="p-4 rounded-xl bg-ink-50 border border-ink-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                <span className="text-xs font-medium text-ink-800">Comprovativo em PDF</span>
              </div>
              <a
                href={proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Abrir PDF <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="relative group">
              <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="block">
                <ResponsiveImage
                  src={proofUrl}
                  alt="Comprovativo do cliente"
                  className="rounded-xl border border-ink-200 max-h-56 w-full object-contain bg-ink-900/5 group-hover:opacity-95 transition"
                  fallbackText="Comprovativo não disponível"
                />
                <div className="mt-1 text-center">
                  <span className="text-[11px] text-brand-600 font-medium inline-flex items-center gap-1 hover:underline">
                    Ver comprovativo em tamanho real <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </a>
            </div>
          )}

          {paymentReference && (
            <p className="text-xs text-ink-600">
              <strong>ID / Ref da Transação:</strong> <span className="font-mono">{paymentReference}</span>
            </p>
          )}
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-ink-50 border border-ink-200 text-xs text-ink-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-ink-400 shrink-0" />
          <span>Nenhum comprovativo em ficheiro anexado ainda pelo cliente.</span>
        </div>
      )}

      {/* Ações de aprovação / rejeição rápida */}
      {paymentStatus !== "PAID" ? (
        <div className="flex items-center gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => handleAction("approve")}
            loading={loading === "approve"}
            disabled={!!loading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
          >
            {loading === "approve" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            Aprovar Pagamento
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleAction("reject")}
            loading={loading === "reject"}
            disabled={!!loading}
            className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
          >
            <XCircle className="w-3.5 h-3.5" /> Rejeitar
          </Button>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Pagamento verificado e aprovado.</span>
        </div>
      )}

      {message && (
        <p className="text-xs text-emerald-700 font-medium">{message}</p>
      )}
    </div>
  );
}
