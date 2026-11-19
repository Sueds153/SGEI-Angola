"use client";

import { useState, useEffect } from "react";
import { Card, Badge, Select, Input } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import {
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Zap,
  ArrowUpDown,
  MoreVertical,
  ExternalLink,
  Loader2,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/types";
import Link from "next/link";

interface ManualReviewItem {
  id: number;
  url: string;
  platform: string | null;
  reason: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "FAILED";
  userId: number | null;
  assignedTo: number | null;
  priority: number;
  attempts: number;
  lastError: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: number; name: string; email: string } | null;
  assignee?: { id: number; name: string; email: string } | null;
}

interface PaginatedResponse {
  items: ManualReviewItem[];
  total: number;
  limit: number;
  offset: number;
}

const STATUS_LABELS: Record<string, { label: string; color: "default" | "warning" | "info" | "success" | "danger" }> = {
  PENDING: { label: "Pendente", color: "warning" },
  IN_PROGRESS: { label: "Em Progresso", color: "info" },
  RESOLVED: { label: "Resolvido", color: "success" },
  FAILED: { label: "Falhou", color: "danger" },
};

const PRIORITY_LABELS: Record<number, { label: string; color: string; icon: React.ReactNode }> = {
  0: { label: "Normal", color: "text-ink-500", icon: <Clock className="w-3 h-3" /> },
  1: { label: "Baixa", color: "text-blue-600", icon: <ArrowUpDown className="w-3 h-3" /> },
  5: { label: "Média", color: "text-amber-600", icon: <Zap className="w-3 h-3" /> },
  10: { label: "Alta", color: "text-red-600", icon: <AlertTriangle className="w-3 h-3" /> },
};

export default function ManualReviewPage() {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    status: "ALL" as "ALL" | "PENDING" | "IN_PROGRESS" | "RESOLVED" | "FAILED",
    search: "",
    priority: "",
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function fetchData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status !== "ALL") params.set("status", filters.status);
      if (filters.search) params.set("search", filters.search);
      if (filters.priority) params.set("priority", filters.priority);
      params.set("limit", "50");
      params.set("offset", "0");

      const res = await fetch(`/api/admin/manual-review?${params}`);
      if (!res.ok) throw new Error("Falha ao carregar fila");
      const result = await res.json();
      setData(result);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [filters]);

  async function handleAction(itemId: number, action: "assign" | "resolve" | "retry" | "delete") {
    setActionLoading(itemId);
    setMessage(null);
    try {
      let body: any = {};
      if (action === "assign") {
        body = { status: "IN_PROGRESS", assignedTo: 1 }; // TODO: usar session userId
      } else if (action === "resolve") {
        body = { status: "RESOLVED" };
      } else if (action === "retry") {
        body = { status: "PENDING", attempts: 0, lastError: null };
      }

      const res = await fetch(`/api/admin/manual-review?id=${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Erro ao atualizar");

      setMessage({ type: "success", text: "Atualizado com sucesso" });
      fetchData();
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(itemId: number) {
    if (!confirm("Tem a certeza que deseja remover este item da fila?")) return;
    setActionLoading(itemId);
    try {
      const res = await fetch(`/api/admin/manual-review?id=${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao remover");
      setMessage({ type: "success", text: "Removido com sucesso" });
      fetchData();
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setActionLoading(null);
    }
  }

  function openUrl(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setMessage({ type: "success", text: "Link copiado" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Fila de Revisão Manual</h1>
          <p className="mt-1 text-sm text-ink-500">
            URLs que falharam na resolução automática e requerem intervenção da equipa.
          </p>
        </div>
        <Button onClick={fetchData} variant="secondary" size="sm">
          <RefreshCw className="w-4 h-4" /> Atualizar
        </Button>
      </div>

      {message && (
        <div
          className={cn(
            "rounded-xl p-4 flex items-center gap-3 text-sm font-medium animate-slide-in",
            message.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-red-50 border border-red-200 text-red-700"
          )}
        >
          {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Filtros */}
      <Card className="p-4 rounded-2xl">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <Input
              placeholder="Buscar por URL, razão ou plataforma..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
          <Select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
            options={[
              { value: "ALL", label: "Todos os Status" },
              { value: "PENDING", label: "Pendente" },
              { value: "IN_PROGRESS", label: "Em Progresso" },
              { value: "RESOLVED", label: "Resolvido" },
              { value: "FAILED", label: "Falhou" },
            ]}
            className="w-full sm:w-48"
          />
          <Select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            options={[
              { value: "", label: "Todas Prioridades" },
              { value: "10", label: "Alta (10)" },
              { value: "5", label: "Média (5)" },
              { value: "1", label: "Baixa (1)" },
              { value: "0", label: "Normal (0)" },
            ]}
            className="w-full sm:w-48"
          />
        </div>
      </Card>

      {/* Tabela */}
      <Card className="rounded-2xl overflow-hidden">
        {loading && !data ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" />
            <p className="text-ink-500">A carregar fila...</p>
          </div>
        ) : message && message.type === "error" ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-ink-900">Erro ao carregar</h3>
            <p className="mt-1 text-sm text-red-600">{message.text}</p>
            <Button onClick={fetchData} variant="secondary" size="sm" className="mt-4">
              <RefreshCw className="w-4 h-4" /> Tentar novamente
            </Button>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-ink-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-ink-900">Fila vazia</h3>
            <p className="mt-1 text-sm text-ink-500">
              {filters.status !== "ALL" || filters.search ? "Nenhum item corresponde aos filtros." : "Todas as URLs foram processadas automaticamente."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ink-50/80 text-ink-500 text-xs uppercase tracking-wide border-b border-ink-100 sticky top-0">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium w-8">#</th>
                    <th className="text-left px-5 py-3 font-medium">URL / Plataforma</th>
                    <th className="text-left px-5 py-3 font-medium">Razão</th>
                    <th className="text-left px-5 py-3 font-medium w-32">Status</th>
                    <th className="text-center px-5 py-3 font-medium w-20">Prioridade</th>
                    <th className="text-center px-5 py-3 font-medium w-16">Tentativas</th>
                    <th className="text-left px-5 py-3 font-medium w-40">Criado</th>
                    <th className="text-right px-5 py-3 font-medium w-56">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {data.items.map((item) => {
                    const statusInfo = STATUS_LABELS[item.status];
                    const priorityInfo = PRIORITY_LABELS[item.priority] || PRIORITY_LABELS[0];
                    const isActionLoading = actionLoading === item.id;

                    return (
                      <tr key={item.id} className={cn("hover:bg-ink-50/60 transition", item.status === "PENDING" && "bg-amber-50/20")}>
                        <td className="px-5 py-3 font-mono text-ink-500 text-xs">#{item.id}</td>

                        <td className="px-5 py-3">
                          <div className="flex items-start gap-2">
                            {item.platform && (
                              <Badge color="primary" className="text-[10px] shrink-0 mt-0.5">
                                {item.platform}
                              </Badge>
                            )}
                            <div className="min-w-0 flex-1">
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-[12px] text-brand-600 hover:underline truncate block pr-2"
                                title={item.url}
                              >
                                {item.url.length > 60 ? item.url.slice(0, 60) + "…" : item.url}
                              </a>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-ink-400 hover:text-ink-600 hover:bg-ink-100"
                                  onClick={() => copyUrl(item.url)}
                                  title="Copiar link"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-ink-400 hover:text-ink-600 hover:bg-ink-100"
                                  onClick={() => openUrl(item.url)}
                                  title="Abrir no browser"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3">
                          <div className="text-xs text-ink-600 max-w-xs truncate" title={item.reason}>
                            {item.reason}
                          </div>
                          {item.lastError && (
                            <div className="mt-1 text-[11px] text-red-600 font-mono truncate" title={item.lastError}>
                              Erro: {item.lastError}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-3">
                          <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
                        </td>

                        <td className="px-5 py-3 text-center">
                          <span className={cn("inline-flex items-center justify-center gap-1 font-medium text-[11px]", priorityInfo.color)}>
                            {priorityInfo.icon}
                            {priorityInfo.label}
                          </span>
                        </td>

                        <td className="px-5 py-3 text-center">
                          <span className={cn("font-mono", item.attempts >= 3 ? "text-red-600" : "text-ink-600")}>
                            {item.attempts}
                          </span>
                        </td>

                        <td className="px-5 py-3 text-ink-500 text-xs whitespace-nowrap">
                          {formatDateTime(item.createdAt)}
                        </td>

                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status === "PENDING" && (
                              <>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleAction(item.id, "assign")}
                                  loading={isActionLoading}
                                  className="h-8 px-3 text-[11px]"
                                  title="Assumir e processar"
                                >
                                  <User className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAction(item.id, "resolve")}
                                  loading={isActionLoading}
                                  className="h-8 px-3 text-[11px] text-emerald-600 hover:bg-emerald-50"
                                  title="Marcar como resolvido"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                            {item.status === "FAILED" && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleAction(item.id, "retry")}
                                loading={isActionLoading}
                                className="h-8 px-3 text-[11px]"
                                title="Tentar novamente"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {item.status === "IN_PROGRESS" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAction(item.id, "resolve")}
                                loading={isActionLoading}
                                className="h-8 px-3 text-[11px] text-emerald-600 hover:bg-emerald-50"
                                title="Marcar resolvido"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {item.status === "RESOLVED" && (
                              <Badge color="success" className="text-[10px]">
                                <CheckCircle2 className="w-3 h-3" /> Resolvido
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item.id)}
                              loading={isActionLoading}
                              className="h-7 w-7 text-red-500 hover:bg-red-50 text-red-500"
                              title="Remover da fila"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginação simplificada */}
            {data && data.total > data.limit && (
              <div className="px-5 py-4 border-t border-ink-100 flex items-center justify-between text-sm text-ink-500">
                <span>
                  A mostrar {data.items.length} de {data.total} itens
                </span>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Estatísticas rápidas */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total na Fila"
            value={data.total}
            icon={AlertTriangle}
            color="amber"
          />
          <StatCard
            title="Pendentes"
            value={data.items.filter((i) => i.status === "PENDING").length}
            icon={Clock}
            color="warning"
          />
          <StatCard
            title="Em Progresso"
            value={data.items.filter((i) => i.status === "IN_PROGRESS").length}
            icon={Zap}
            color="blue"
          />
          <StatCard
            title="Resolvidos"
            value={data.items.filter((i) => i.status === "RESOLVED").length}
            icon={CheckCircle2}
            color="emerald"
          />
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: React.ComponentType<{ className?: string }>; color: string }) {
  const colors: Record<string, string> = {
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <Card className={cn("p-4 rounded-2xl border", colors[color])}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <Icon className="w-8 h-8 opacity-50" />
      </div>
    </Card>
  );
}