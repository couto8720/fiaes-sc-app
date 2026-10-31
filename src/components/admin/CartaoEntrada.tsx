import type { ReactNode } from "react";
import { supabaseConfigurado } from "@/lib/supabase/env";

export function CartaoEntrada({ titulo, descricao, children }: { titulo: string; descricao?: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-sm py-6">
      <p className="text-xs font-bold uppercase tracking-wide text-suave">Área do staff</p>
      <h1 className="mt-1 text-2xl font-black tracking-tight">{titulo}</h1>
      {descricao && <p className="mt-1 text-sm text-suave">{descricao}</p>}
      <div className="mt-6 rounded-2xl border border-borda bg-superficie p-5 shadow-sm">
        {supabaseConfigurado ? children : <AvisoSemSupabase />}
      </div>
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
