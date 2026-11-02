import type { ReactNode } from "react";
import { supabaseConfigurado } from "@/lib/supabase/env";
import { SIMBOLO_LOCAL } from "@/lib/simbolo";

/**
 * Cartão das páginas de entrada (staff e adeptos): cabeçalho verde com o símbolo do Fiães,
 * título e o formulário por baixo.
 */
export function CartaoEntrada({
  titulo,
  descricao,
  area = "Área do staff",
  rodape,
  children,
}: {
  titulo: string;
  descricao?: string;
  /** Pequeno texto por cima do título ("Área do staff", "Sócios e adeptos"). */
  area?: string;
  /** Links por baixo do cartão (ex.: "Criar conta", "És do staff?"). */
  rodape?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-sm py-4">
      <div className="overflow-hidden rounded-3xl border border-borda bg-superficie shadow-md">
        <div className="relative flex flex-col items-center bg-gradient-to-br from-clube to-clube-escuro px-6 pt-7 pb-6 text-center text-clube-texto">
          {/* Faixa amarela do clube */}
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-1.5 bg-destaque" />
          {/* eslint-disable-next-line @next/next/no-img-element -- símbolo incluído na app */}
          <img src={SIMBOLO_LOCAL} alt="Símbolo do Fiães Sport Clube" width={72} height={87} className="h-20 w-auto drop-shadow-md" />
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-destaque">{area}</p>
          <h1 className="font-display text-5xl uppercase leading-none">{titulo}</h1>
          {descricao && <p className="mt-2 text-sm opacity-90">{descricao}</p>}
        </div>
        <div className="p-5">{supabaseConfigurado ? children : <AvisoSemSupabase />}</div>
      </div>
      {rodape && <div className="mt-4 space-y-2 text-center text-sm">{rodape}</div>}
    </div>
  );
}

export function AvisoSemSupabase() {
  return (
    <p className="text-sm">
      O painel precisa do Supabase configurado (o modo demonstração só mostra a área pública). Preenche o{" "}
      <code>.env.local</code> como explicado no README.
    </p>
  );
}
