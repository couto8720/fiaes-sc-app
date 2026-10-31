"use client";

import { useState } from "react";

export function BotaoPartilhar({ titulo }: { titulo: string }) {
  const [copiado, setCopiado] = useState(false);

  async function partilhar() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, text: titulo, url });
        return;
      } catch {
        return; // utilizador cancelou
      }
    }
    try {
      await navigator.clipboard.writeText(`${titulo} ${url}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt("Copia o link:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={partilhar}
      className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-borda bg-superficie font-semibold"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6" />
      </svg>
      {copiado ? "Link copiado" : "Partilhar"}
    </button>
  );
}
