"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function HomeSearchBar() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/pesquisa?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-0 w-full max-w-xl sm:bg-white sm:rounded-full sm:border sm:border-ink-200 sm:shadow-sm sm:p-1.5 sm:ring-1 sm:ring-black/5">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Procura por roupa, sapatos, acessórios…"
          className="w-full sm:bg-transparent bg-white rounded-full border border-ink-200 sm:border-0 pl-11 pr-4 py-3.5 sm:py-2.5 text-[15px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-100 sm:focus:ring-0"
        />
      </div>
      <Button type="submit" size="md" className="rounded-full sm:h-11 sm:px-5">
        <Search className="h-4 w-4 sm:hidden" />
        Pesquisar
      </Button>
    </form>
  );
}
