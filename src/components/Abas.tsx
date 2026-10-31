"use client";

import { useState, type ReactNode } from "react";

export function Abas({ abas }: { abas: { id: string; rotulo: string; conteudo: ReactNode }[] }) {
  const [ativa, setAtiva] = useState(abas[0].id);

  return (
    <>
      <div role="tablist" className="mb-4 grid grid-flow-col gap-1 rounded-xl bg-borda/60 p-1">
        {abas.map((a) => (
          <button
            key={a.id}
            role="tab"
            id={`aba-${a.id}`}
            aria-selected={a.id === ativa}
            aria-controls={`painel-${a.id}`}
            onClick={() => setAtiva(a.id)}
            className={`h-10 rounded-lg text-sm font-semibold transition-colors ${
              a.id === ativa ? "bg-superficie text-texto shadow-sm" : "text-suave"
            }`}
          >
            {a.rotulo}
          </button>
        ))}
      </div>
      {abas.map((a) => (
        // Os painéis ficam todos montados (só escondidos) para o tempo real continuar a funcionar.
        <div key={a.id} role="tabpanel" id={`painel-${a.id}`} aria-labelledby={`aba-${a.id}`} hidden={a.id !== ativa}>
          {a.conteudo}
        </div>
      ))}
    </>
  );
}
