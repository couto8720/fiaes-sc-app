import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { exigirSessao, podeEditarEscalao } from "@/lib/sessao";
import { isoParaLisboa } from "@/lib/datas";
import { FormJogo } from "@/components/admin/FormJogo";
import { GestorGolos } from "@/components/admin/GestorGolos";
import { golosParaEditar } from "@/lib/golosAdmin";
import { obterConfig } from "@/lib/dados";
import { BotaoSubmeter } from "@/components/admin/ui";
import { Esqueleto } from "@/components/Esqueleto";
import { apagarJogo } from "../../../acoes/jogos";

export const metadata: Metadata = { title: "Editar jogo" };

export default function EditarJogo({ params }: PageProps<"/admin/jogos/[id]">) {
  return (
    <>
      <h1 className="mb-4 text-2xl font-black tracking-tight">Editar jogo</h1>
      <Suspense fallback={<Esqueleto cartoes={2} />}>
        <ConteudoEditarJogo params={params} />
      </Suspense>
    </>
  );
}

async function ConteudoEditarJogo({ params }: Pick<PageProps<"/admin/jogos/[id]">, "params">) {
  const [sessao, { id }] = await Promise.all([exigirSessao(), params]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const [{ data: jogo }, { data: locais }] = await Promise.all([
    supabase.from("jogos").select("*").eq("id", id).maybeSingle(),
    supabase.from("locais").select("id, nome").order("nome"),
  ]);
  if (!jogo) notFound();

  if (!podeEditarEscalao(sessao, jogo.escalao_id)) {
    return (
      <p className="rounded-xl border border-dashed border-borda p-6 text-center text-suave">
        Este jogo é de um escalão que não geres. <Link href="/admin" className="underline">Voltar</Link>
      </p>
    );
  }

  const [{ golos, sugestoes }, config] = await Promise.all([golosParaEditar(jogo.id, jogo.escalao_id), obterConfig()]);
  const { data, hora } = isoParaLisboa(jogo.data_hora);
  const inicial: Record<string, string> = {
    escalao_id: jogo.escalao_id,
    data,
    hora,
    adversario: jogo.adversario,
    em_casa: jogo.em_casa ? "1" : "0",
    local_id: jogo.local_id ?? "",
    competicao: jogo.competicao ?? "",
    jornada: jogo.jornada?.toString() ?? "",
    estado: jogo.estado,
    golos_clube: jogo.golos_clube?.toString() ?? "",
    golos_adversario: jogo.golos_adversario?.toString() ?? "",
    notas: jogo.notas ?? "",
  };

  return (
    <>
      <Link
        href={`/admin/jogos/${jogo.id}/marcador`}
        className="mb-5 flex h-12 items-center justify-center rounded-xl bg-ao-vivo font-bold text-white"
      >
        Abrir marcador ao vivo
      </Link>
      <FormJogo id={jogo.id} escaloes={sessao.escaloes} locais={locais ?? []} inicial={inicial} />
      {jogo.golos_clube !== null && (
        <div className="mt-8">
          <GestorGolos
            jogoId={jogo.id}
            iniciais={golos}
            sugestoes={sugestoes}
            golosClube={jogo.golos_clube}
            nomeClube={config.nome_curto}
          />
        </div>
      )}
      <form action={apagarJogo} className="mt-10 border-t border-borda pt-6">
        <input type="hidden" name="id" value={jogo.id} />
        <BotaoSubmeter variante="perigo" confirmar="Apagar este jogo? Não é possível desfazer.">
          Apagar jogo
        </BotaoSubmeter>
      </form>
    </>
  );
}
