"use client";

import { useState } from "react";
import { Copy, CheckCheck, Share2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function OrderActions({ reference }: { reference: string }) {
  const [copied, setCopied] = useState(false);
  const orderUrl = typeof window !== "undefined" ? `${window.location.origin}/pedido/${reference}` : "";

  function copyRef() {
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  function copyLink() {
    navigator.clipboard.writeText(orderUrl);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={copyRef}>
        {copied ? <CheckCheck className="h-4 w-4 text-success-600" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copiado" : "Copiar referência"}
      </Button>
      <Button variant="ghost" size="sm" onClick={copyLink}>
        <Share2 className="h-4 w-4" /> Copiar link
      </Button>
      <a
        href={`https://wa.me/244923000000?text=${encodeURIComponent(`Olá! Preciso de ajuda com o pedido #${reference}`)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button size="sm" variant="primary">
          <MessageCircle className="h-4 w-4" /> Preciso de ajuda
        </Button>
      </a>
    </div>
  );
}
