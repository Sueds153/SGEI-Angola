"use client";

import { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, FileText, AlertCircle, Loader2, Eye, MessageCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";

interface PaymentProofUploadProps {
  orderReference: string;
  currentProofUrl?: string | null;
  paymentStatus?: string;
  onSuccess?: (proofUrl: string) => void;
}

export function PaymentProofUpload({
  orderReference,
  currentProofUrl,
  paymentStatus,
  onSuccess,
}: PaymentProofUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [transactionCode, setTransactionCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedProofUrl, setSavedProofUrl] = useState<string | null>(currentProofUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isReviewing = paymentStatus === "REVIEW" || paymentStatus === "SENT" || success;
  const isPaid = paymentStatus === "PAID";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 10 * 1024 * 1024) {
      setError("O ficheiro deve ter no máximo 10MB.");
      return;
    }

    setFile(selected);
    if (selected.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError(null);
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;

    if (dropped.size > 10 * 1024 * 1024) {
      setError("O ficheiro deve ter no máximo 10MB.");
      return;
    }

    setFile(dropped);
    if (dropped.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(dropped);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !transactionCode.trim()) {
      setError("Por favor selecione o ficheiro do comprovativo ou insira o código de transação.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("reference", orderReference);
      if (file) formData.append("file", file);
      if (transactionCode) formData.append("transactionCode", transactionCode);

      const res = await fetch("/api/orders/proof", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Erro ao submeter comprovativo.");
      }

      setSuccess(true);
      if (data.proofUrl) setSavedProofUrl(data.proofUrl);
      if (onSuccess) onSuccess(data.proofUrl);
    } catch (err: any) {
      setError(err.message || "Erro de ligação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (isPaid) {
    return (
      <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
        <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">Pagamento Confirmado & Aprovado</h4>
          <p className="text-xs text-emerald-700 mt-0.5">
            O seu comprovativo foi verificado pela nossa equipa administrativa. O seu pedido está em processamento de compra.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border-2 border-brand-200 p-5 shadow-sm text-left">
      <div className="flex items-center justify-between pb-3 border-b border-brand-100">
        <div className="flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-brand-600" />
          <h3 className="font-bold text-ink-900 text-sm md:text-base">
            Submeter Comprovativo de Pagamento
          </h3>
        </div>
        {isReviewing ? (
          <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Em Validação
          </span>
        ) : (
          <span className="text-[11px] font-semibold bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-full">
            Verificação Direta
          </span>
        )}
      </div>

      {isReviewing && !file ? (
        <div className="mt-4 space-y-3">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
            <p className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              Comprovativo em análise pela equipa administrativa!
            </p>
            <p className="text-amber-800">
              Recebemos o seu envio no sistema. A verificação é realizada no painel backoffice e o estado do pedido atualizará automaticamente.
            </p>
          </div>

          {savedProofUrl && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-ink-50 border border-ink-200 text-xs text-ink-700">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span className="truncate">Comprovativo registado</span>
              </div>
              <a
                href={savedProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700 shrink-0"
              >
                <Eye className="w-3.5 h-3.5" /> Ver ficheiro
              </a>
            </div>
          )}

          <p className="text-[11px] text-ink-500 text-center">
            Precisa de reenviar outro talão? Pode selecionar um novo ficheiro abaixo.
          </p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-ink-300 hover:border-brand-500 rounded-xl p-5 text-center cursor-pointer transition bg-ink-50/50 hover:bg-brand-50/30 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          {preview ? (
            <div className="space-y-2">
              <ResponsiveImage
                src={preview}
                alt="Pré-visualização do comprovativo"
                className="max-h-48 mx-auto rounded-lg shadow-sm border border-ink-200 object-contain"
                fallbackText="Pré-visualização não disponível"
              />
              <p className="text-xs text-ink-600 font-medium">{file?.name} (Clique para alterar)</p>
            </div>
          ) : file ? (
            <div className="flex items-center justify-center gap-2 text-ink-800 py-4">
              <FileText className="w-6 h-6 text-brand-600" />
              <span className="text-xs font-semibold">{file.name}</span>
            </div>
          ) : (
            <div className="space-y-1.5 py-2">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 grid place-items-center mx-auto group-hover:scale-105 transition">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-ink-900">
                Toque para anexar a foto ou captura do comprovativo
              </p>
              <p className="text-[11px] text-ink-500">
                JPG, PNG, WEBP ou PDF (talão de transferência Express ou ATM)
              </p>
            </div>
          )}
        </div>

        {/* Campo opcional de Código de Transação */}
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">
            Código / ID da Transação Multicaixa Express (opcional)
          </label>
          <input
            type="text"
            value={transactionCode}
            onChange={(e) => setTransactionCode(e.target.value)}
            placeholder="Ex: 9841203"
            className="w-full text-xs px-3 py-2.5 rounded-xl border border-ink-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none font-mono"
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>Comprovativo submetido com sucesso! A equipa administrativa irá validar no backoffice.</span>
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          size="md"
          loading={loading}
          disabled={loading || (!file && !transactionCode.trim())}
          className="bg-brand-600 hover:bg-brand-700 font-bold text-xs"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> A submeter comprovativo...
            </span>
          ) : (
            "Submeter Comprovativo para o Painel Admin"
          )}
        </Button>
      </form>

      {/* Apoio ao Cliente via WhatsApp 922 058 136 */}
      <div className="mt-4 pt-3 border-t border-ink-100 flex items-center justify-between text-[11px] text-ink-500">
        <span className="flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-brand-600" /> Validação 100% segura
        </span>
        <a
          href={`https://wa.me/244922058136?text=${encodeURIComponent(
            `Olá ImportEasy! Preciso de ajuda com o comprovativo do pedido #${orderReference}.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 transition"
        >
          <MessageCircle className="w-3.5 h-3.5" /> Dúvidas? Apoio no WhatsApp (922 058 136)
        </a>
      </div>
    </div>
  );
}
