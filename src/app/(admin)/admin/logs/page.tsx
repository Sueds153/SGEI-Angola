import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card, Badge } from "@/components/ui";
import type { Metadata } from "next";
import { formatDateTime } from "@/lib/types";

export const metadata: Metadata = { title: "Logs de auditoria" };
export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const all = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(200);
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Logs de auditoria</h1>
        <p className="mt-1 text-sm text-ink-500">Registo de ações administrativas.</p>
      </div>
      <Card className="rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full admin-table text-sm">
            <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Data</th>
                <th className="text-left px-5 py-3 font-medium">Ator</th>
                <th className="text-left px-5 py-3 font-medium">Ação</th>
                <th className="text-left px-5 py-3 font-medium">Entidade</th>
              </tr>
            </thead>
            <tbody>
              {all.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-ink-500">
                    Sem logs.
                  </td>
                </tr>
              )}
              {all.map((l) => (
                <tr key={l.id} className="border-t border-ink-100">
                  <td data-label="Data" className="px-5 py-3 text-ink-500 text-xs whitespace-nowrap">
                    {formatDateTime(l.createdAt)}
                  </td>
                  <td data-label="Ator" className="px-5 py-3">{l.actorEmail || `#${l.actorId}`}</td>
                  <td data-label="Ação" className="px-5 py-3 font-medium">{l.action}</td>
                  <td data-label="Entidade" className="px-5 py-3 text-ink-500 text-xs">
                    {l.entityType} {l.entityId && `#${l.entityId}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
