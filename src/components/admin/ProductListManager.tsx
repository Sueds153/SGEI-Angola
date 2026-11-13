"use client";

import { useState } from "react";
import { Card, Badge, Input } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Plus, Package, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { formatUsd } from "@/lib/types";
import { useRouter } from "next/navigation";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";

interface ProductItem {
  id: number;
  name: string;
  slug: string;
  originalPrice: string | null;
  source: string;
  status: string;
  sku: string | null;
  defaultImage: string | null;
  categoryName?: string | null;
}

interface CategoryOption {
  id: number;
  name: string;
}

export function ProductListManager({
  initialProducts,
  categories,
}: {
  initialProducts: ProductItem[];
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [productList, setProductList] = useState<ProductItem[]>(initialProducts);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [sku, setSku] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    const slug =
      name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") +
      "-" +
      Date.now().toString().slice(-4);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          originalPrice: price,
          categoryId: categoryId ? Number(categoryId) : null,
          defaultImage: imageUrl.trim() || null,
          sku: sku.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar produto.");

      setProductList([
        {
          id: data.product.id,
          name: data.product.name,
          slug: data.product.slug,
          originalPrice: data.product.originalPrice,
          source: "ADMIN",
          status: "ACTIVE",
          sku: data.product.sku,
          defaultImage: data.product.defaultImage,
          categoryName: categories.find((c) => c.id === Number(categoryId))?.name || null,
        },
        ...productList,
      ]);

      setName("");
      setPrice("");
      setCategoryId("");
      setImageUrl("");
      setSku("");
      setSuccess(true);
      setShowAddForm(false);
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Catálogo de Produtos</h1>
          <p className="mt-1 text-sm text-ink-500">
            {productList.length} produtos em catálogo (Produtos ADMIN e DEMO inicial).
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setError(null);
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          {showAddForm ? "Fechar Formulário" : "Novo Produto"}
        </Button>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Produto adicionado com sucesso ao catálogo!
        </div>
      )}

      {/* Formulário de Adicionar Produto */}
      {showAddForm && (
        <Card className="p-6 rounded-2xl border-2 border-brand-500/20 bg-brand-50/20">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-bold text-ink-900">Cadastrar Novo Produto Manualmente</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600 mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Vestido Elegante Manga Longa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600 mb-1">
                  Preço Base em USD ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ex: 24.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600 mb-1">
                  Categoria
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Selecione uma categoria...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600 mb-1">
                  Código / SKU (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: SH-89214"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600 mb-1">
                URL da Imagem de Destaque
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
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
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={loading}>
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Plus className="w-3.5 h-3.5 mr-1.5" />}
                Guardar Produto
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tabela de Produtos */}
      <Card className="rounded-2xl overflow-hidden border border-ink-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full admin-table text-sm">
            <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Produto</th>
                <th className="text-left px-5 py-3 font-semibold">Categoria</th>
                <th className="text-left px-5 py-3 font-semibold">Preço USD</th>
                <th className="text-left px-5 py-3 font-semibold">Origem</th>
                <th className="text-left px-5 py-3 font-semibold">Estado</th>
                <th className="text-left px-5 py-3 font-semibold">SKU</th>
              </tr>
            </thead>
            <tbody>
              {productList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-ink-500">
                    Ainda não existem produtos criados manualmente.
                  </td>
                </tr>
              ) : (
                productList.map((p) => (
                  <tr key={p.id} className="border-t border-ink-100 hover:bg-ink-50/60 transition">
                    <td className="px-5 py-3.5 font-medium flex items-center gap-3">
                      {p.defaultImage ? (
                        <ResponsiveImage
                          src={p.defaultImage}
                          alt={p.name}
                          width={40}
                          height={40}
                          className="rounded-lg object-cover bg-ink-100 border border-ink-200"
                          fallbackText="Sem imagem"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-ink-100 text-ink-400 grid place-items-center">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                      <span className="line-clamp-1 max-w-xs font-semibold text-ink-900">{p.name}</span>
                    </td>
                    <td className="px-5 py-3.5 text-ink-600">{p.categoryName || "—"}</td>
                    <td className="px-5 py-3.5 font-semibold tabular-nums text-ink-900">
                      {p.originalPrice ? formatUsd(Number(p.originalPrice)) : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge color={p.source === "ADMIN" ? "success" : "default"}>{p.source}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge color={p.status === "ACTIVE" ? "success" : "warning"}>{p.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-ink-500 font-mono text-xs">{p.sku || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
