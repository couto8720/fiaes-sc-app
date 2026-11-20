import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { exigirSessao, podeEditarEscalao } from "@/lib/sessao";
import { obterConfig } from "@/lib/dados";
import { Marcador } from "@/components/admin/Marcador";
import { expulsoesParaEditar, golosParaEditar } from "@/lib/golosAdmin";
import { Esqueleto } from "@/components/Esqueleto";

export const metadata: Metadata = { title: "Marcador" };

export default function PaginaMarcador({ params }: PageProps<"/admin/jogos/[id]/marcador">) {
  return (
    <Suspense fallback={<Esqueleto cartoes={2} />}>
      <ConteudoMarcador params={params} />
    </Suspense>
  );
}

async function ConteudoMarcador({ params }: Pick<PageProps<"/admin/jogos/[id]/marcador">, "params">) {
  const [sessao, config, { id }] = await Promise.all([exigirSessao(), obterConfig(), params]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("jogos" as any)
    .select("*, escalao:escaloes(nome), local:locais(nome)")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  if (!podeEditarEscalao(sessao, data.escalao_id)) {
    return (
      <p className="rounded-xl border border-dashed border-borda p-6 text-center text-suave">
        Este jogo é de um escalão que não geres. <Link href="/admin" className="underline">Voltar</Link>
      </p>
    );
  }

  const { escalao, local, ...jogo } = data;
  const [{ golos, sugestoes }, expulsoes] = await Promise.all([golosParaEditar(jogo.id, jogo.escalao_id), expulsoesParaEditar(jogo.id)]);
  return (
    <Marcador
      jogo={jogo}
      nomeClube={config.nome_curto}
      escalao={escalao?.nome ?? ""}
      local={local?.nome ?? null}
      golos={golos}
      expulsoes={expulsoes}
      sugestoes={sugestoes}
    />
  );
}
