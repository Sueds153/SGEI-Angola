"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert, Card } from "@/components/ui";
import { RefreshCw, Trash2, DollarSign, Database, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemStatus {
  exchangeRates: {
    USD_TO_AOA: number;
    EUR_TO_AOA: number;
    CNY_TO_AOA: number;
    updatedAt: string;
  };
  cache: {
    size: number;
    keys: string[];
  };
  providers: {
    scrapingbee: boolean;
    zenrows: boolean;
    rapidapi: boolean;
  };
}

export function SystemConfig() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/admin/system");
      if (!res.ok) throw new Error("Falha ao carregar status");
      const data = await res.json();
      setStatus(data);
    } catch (error: any) {
      console.error("Erro ao carregar status:", error);
    }
  }

  async function handleAction(action: string, extra?: any) {
    setActionLoading(action);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha na ação");
      
      setMessage({ type: "success", text: data.message });
      if (action === "update-rates" || action === "set-rates") {
        setStatus(prev => prev ? { ...prev, exchangeRates: data.rates } : null);
      }
      if (action === "clear-cache") {
        fetchStatus();
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setActionLoading(null);
    }
  }

  function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency,
    }).format(amount);
  }

  function formatRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "agora mesmo";
    if (diffMins < 60) return `há ${diffMins} min`;
    if (diffHours < 24) return `há ${diffHours}h`;
    return `há ${diffDays}d`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-ink-900">Configurações do Sistema</h2>
        <Button
          size="sm"
          variant="secondary"
          onClick={fetchStatus}
          disabled={loading}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      {message && (
        <Alert variant={message.type === "success" ? "success" : "error"}>
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {message.text}
          </div>
        </Alert>
      )}

      {/* Taxas de Câmbio */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-ink-500" />
          <h3 className="text-lg font-medium text-ink-900">Taxas de Câmbio</h3>
        </div>

        {status?.exchangeRates && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-ink-50 rounded-xl">
                <div className="text-sm text-ink-500 mb-1">USD → AOA</div>
                <div className="text-2xl font-semibold text-ink-900">
                  {status.exchangeRates.USD_TO_AOA} Kz
                </div>
              </div>
              <div className="p-4 bg-ink-50 rounded-xl">
                <div className="text-sm text-ink-500 mb-1">EUR → AOA</div>
                <div className="text-2xl font-semibold text-ink-900">
                  {status.exchangeRates.EUR_TO_AOA} Kz
                </div>
              </div>
              <div className="p-4 bg-ink-50 rounded-xl">
                <div className="text-sm text-ink-500 mb-1">CNY → AOA</div>
                <div className="text-2xl font-semibold text-ink-900">
                  {status.exchangeRates.CNY_TO_AOA} Kz
                </div>
              </div>
            </div>

            <div className="text-sm text-ink-500 mb-4">
              Última atualização: {formatRelativeTime(status.exchangeRates.updatedAt)}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleAction("update-rates")}
                disabled={actionLoading === "update-rates"}
              >
                {actionLoading === "update-rates" ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Atualizar Automaticamente
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Status dos Providers */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-5 w-5 text-ink-500" />
          <h3 className="text-lg font-medium text-ink-900">Providers de Scraping</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-ink-50 rounded-lg">
            <div>
              <div className="font-medium text-ink-900">ScrapingBee</div>
              <div className="text-sm text-ink-500">Proxy principal (recomendado)</div>
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              status?.providers.scrapingbee
                ? "bg-success-100 text-success-700"
                : "bg-warning-100 text-warning-700"
            )}>
              {status?.providers.scrapingbee ? "Configurado" : "Não configurado"}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-ink-50 rounded-lg">
            <div>
              <div className="font-medium text-ink-900">ZenRows</div>
              <div className="text-sm text-ink-500">Backup secundário</div>
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              status?.providers.zenrows
                ? "bg-success-100 text-success-700"
                : "bg-warning-100 text-warning-700"
            )}>
              {status?.providers.zenrows ? "Configurado" : "Não configurado"}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-ink-50 rounded-lg">
            <div>
              <div className="font-medium text-ink-900">RapidAPI</div>
              <div className="text-sm text-ink-500">AliExpress (dados estruturados)</div>
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              status?.providers.rapidapi
                ? "bg-success-100 text-success-700"
                : "bg-warning-100 text-warning-700"
            )}>
              {status?.providers.rapidapi ? "Configurado" : "Não configurado"}
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-ink-500">
          💡 Dica: Configure as chaves de API no arquivo <code className="bg-ink-100 px-1 rounded">.env</code> para habilitar os providers.
        </p>
      </Card>

      {/* Cache */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-ink-500" />
            <h3 className="text-lg font-medium text-ink-900">Cache de Scraping</h3>
          </div>
          <div className="text-sm text-ink-500">
            {status?.cache.size || 0} itens cacheados
          </div>
        </div>

        <p className="text-sm text-ink-600 mb-4">
          O cache armazena resultados de scraping por 30 minutos para evitar requisições repetidas.
        </p>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleAction("clear-cache")}
          disabled={actionLoading === "clear-cache"}
        >
          {actionLoading === "clear-cache" ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          Limpar Cache
        </Button>
      </Card>
    </div>
  );
}
