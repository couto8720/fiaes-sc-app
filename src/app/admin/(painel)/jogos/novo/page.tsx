import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { exigirSessao } from "@/lib/sessao";
import { isoParaLisboa } from "@/lib/datas";
import { FormJogo } from "@/components/admin/FormJogo";
import { Esqueleto } from "@/components/Esqueleto";

export const metadata: Metadata = { title: "Novo jogo" };

const SEMANA = 7 * 86_400_000;

export default function NovoJogo({ searchParams }: PageProps<"/admin/jogos/novo">) {
  return (
    <>
      <h1 className="mb-4 text-2xl font-black tracking-tight">Novo jogo</h1>
      <Suspense fallback={<Esqueleto cartoes={2} />}>
        <ConteudoNovoJogo searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ConteudoNovoJogo({ searchParams }: Pick<PageProps<"/admin/jogos/novo">, "searchParams">) {
  const [sessao, params] = await Promise.all([exigirSessao(), searchParams]);
  const supabase = await createClient();
  const { data: locais } = await supabase.from("locais").select("id, nome").order("nome");

  let inicial: Record<string, string> = {
    escalao_id: typeof params.escalao === "string" ? params.escalao : sessao.escaloes.length === 1 ? sessao.escaloes[0].id : "",
  };

  // "Duplicar": mesmo escalão, competição e local; jornada seguinte, uma semana depois, à mesma hora.
  if (typeof params.duplicar === "string") {
    const { data: base } = await supabase.from("jogos").select("*").eq("id", params.duplicar).maybeSingle();
    if (base) {
      const { data, hora } = isoParaLisboa(new Date(Date.parse(base.data_hora) + SEMANA).toISOString());
      inicial = {
        escalao_id: base.escalao_id,
        competicao: base.competicao ?? "",
        jornada: base.jornada ? String(base.jornada + 1) : "",
        data,
        hora,
        local_id: base.local_id ?? "",
        em_casa: base.em_casa ? "1" : "0",
      };
    }
  }

  return <FormJogo escaloes={sessao.escaloes} locais={locais ?? []} inicial={inicial} />;
}
