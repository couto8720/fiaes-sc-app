"use client";

import type { Escalao } from "@/lib/supabase/database.types";
import { definirFiltroEscalao } from "@/lib/useFiltroEscalao";
import { FILTRO_MEUS } from "@/lib/filtroJogos";

export function FiltroEscaloes({
  escaloes,
  ativo,
  meus = false,
}: {
  escaloes: Pick<Escalao, "slug" | "nome">[];
  ativo: string;
  /** Mostra o chip "⭐ Os meus" (adepto com sessão e escalões escolhidos). */
  meus?: boolean;
}) {
  const opcoes = [{ slug: "", nome: "Todos" }, ...(meus ? [{ slug: FILTRO_MEUS, nome: "⭐ Os meus" }] : []), ...escaloes];
  return (
    <div role="group" aria-label="Filtrar por escalão" className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
      {opcoes.map((e) => {
        const selecionado = e.slug === ativo;
        return (
          <button
            key={e.slug || "todos"}
            type="button"
            aria-pressed={selecionado}
            onClick={() => definirFiltroEscalao(e.slug)}
            className={`h-9 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors ${
              selecionado
                ? "border-clube bg-clube text-clube-texto"
                : "border-borda bg-superficie text-texto hover:border-suave"
            }`}
          >
            {e.nome}
          </button>
        );
      })}
    </div>
  );
}
