"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui";
import { Alert } from "@/components/ui";
import { Loader2 } from "lucide-react";

export function AccountForms() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/" + (mode === "login" ? "login" : "register"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          mode === "login"
            ? { emailOrPhone: email, password }
            : { name, email, phone, password }
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro. Tenta novamente.");
        return;
      }
      router.push("/pedidos");
      router.refresh();
    } catch {
      setError("Erro de ligação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex gap-1 p-1 rounded-lg bg-ink-100 mb-6">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={
            "flex-1 py-2 text-sm font-semibold rounded-md transition " +
            (mode === "login" ? "bg-white shadow-sm text-ink-900" : "text-ink-600")
          }
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={
            "flex-1 py-2 text-sm font-semibold rounded-md transition " +
            (mode === "register" ? "bg-white shadow-sm text-ink-900" : "text-ink-600")
          }
        >
          Criar conta
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "register" && (
          <>
            <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="923 456 789" required />
          </>
        )}
        <Input
          label={mode === "login" ? "Email ou telefone" : "Email (opcional)"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required={mode === "register" ? false : true}
        />
        <Input
          label="Palavra-passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <Alert variant="danger">{error}</Alert>}
        <Button type="submit" size="lg" fullWidth loading={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {mode === "login" ? "Entrar" : "Criar conta"}
        </Button>
      </form>

      <p className="mt-4 text-xs text-ink-500 text-center">
        Não precisas de criar conta para fazer um pedido. Esta área serve apenas para veres o histórico dos teus pedidos.
      </p>
    </div>
  );
}
