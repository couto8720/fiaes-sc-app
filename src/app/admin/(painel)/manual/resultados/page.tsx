import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { exigirSessao } from "@/lib/sessao";
import { formatarDataHora, resumoJogo } from "@/lib/jogos";
import { FormResultado } from "./form";

export const metadata: Metadata = { title: "Registrar Resultado" };

export default function PaginaResultados() {
  return (
    <Suspense fallback={<div className="animate-pulse">Carregando...</div>}>
      <ConteudoResultados />
    </Suspense>
  );
}

async function ConteudoResultados() {
  const sessao = await exigirSessao();
  const supabase = await createClient();

  const ids = sessao.escaloes.map((e) => e.id);

  // Buscar jogos sem resultado
  const { data: jogos } = await supabase
    .from("jogos" as any)
    .select("*, escalao:escaloes(nome)")
    .in("escalao_id", ids)
    .is("golos_clube", null)
    .lt("data_hora", new Date().toISOString())
    .order("data_hora", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-black tracking-tight">Registrar Resultados</h1>
        <p className="text-suave">
          Registre o resultado dos jogos que já foram realizados
        </p>
      </div>

      <FormResultado escaloes={sessao.escaloes} />

      {/* Jogos Pendentes */}
      {jogos && jogos.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-bold">Jogos Sem Resultado</h2>
          <div className="rounded-xl border border-borda overflow-hidden">
            <ul className="divide-y divide-borda">
              {jogos.map((jogo) => (
                <li key={jogo.id} className="p-4 hover:bg-borda/30 transition">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase text-suave">
                        {formatarDataHora(jogo.data_hora)} · {jogo.escalao?.nome}
                      </p>
                      <p className="font-semibold">{resumoJogo(jogo, "Fiães")}</p>
                    </div>
                    <Link
                      href={`/admin/jogos/${jogo.id}/marcador`}
                      className="flex-shrink-0 rounded-lg bg-clube px-4 py-2 font-semibold text-clube-texto hover:opacity-90"
                    >
                      Registrar
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {(!jogos || jogos.length === 0) && (
        <div className="rounded-xl border border-dashed border-borda p-6 text-center text-suave">
          <p>Nenhum jogo pendente de resultado</p>
        </div>
      )}
    </div>
  );
}
