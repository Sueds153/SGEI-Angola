"use client";

import { useState } from "react";
import { Card, Input } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Plus, Tags, Loader2, CheckCircle2, AlertCircle, FolderPlus } from "lucide-react";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto-geração amigável de slug ao digitar nome
  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/\s+/g, "-")) {
      setSlug(
        val
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar categoria");
      }

      setCategories([data.category, ...categories]);
      setName("");
      setSlug("");
      setDescription("");
      setSuccess(true);
      setShowForm(false);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Categorias</h1>
          <p className="mt-1 text-sm text-ink-500">
            {categories.length} categorias ativas no catálogo e simulação.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setShowForm(!showForm);
            setError(null);
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          {showForm ? "Fechar Formulário" : "Nova Categoria"}
        </Button>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Categoria criada com sucesso e disponível no catálogo!
        </div>
      )}

      {/* Formulário de Criação Rápida */}
      {showForm && (
        <Card className="p-6 rounded-2xl border-2 border-brand-500/20 bg-brand-50/20">
          <div className="flex items-center gap-2 mb-4">
            <FolderPlus className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-bold text-ink-900">Adicionar Nova Categoria</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600 mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Vestuário Feminino, Calçados..."
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600 mb-1">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: vestuario-feminino"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600 mb-1">
                Descrição Breve (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Roupas, vestidos e moda internacional da SHEIN"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={loading}>
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Plus className="w-3.5 h-3.5 mr-1.5" />}
                Guardar Categoria
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Grid de Categorias */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <Card key={c.id} className="p-5 rounded-2xl hover:shadow-sm transition border border-ink-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 grid place-items-center">
                  <Tags className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-ink-900">{c.name}</p>
                  <p className="text-xs font-mono text-ink-400">/{c.slug}</p>
                </div>
              </div>
              {c.description && (
                <p className="mt-3 text-xs text-ink-600 line-clamp-2">{c.description}</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
