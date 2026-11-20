import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { exigirSessao } from "@/lib/sessao";
import { obterConfig } from "@/lib/dados";
import { EditorClassificacao } from "@/components/admin/EditorClassificacao";
import { Esqueleto } from "@/components/Esqueleto";

export const metadata: Metadata = { title: "Atualizar classificação" };

export default function EditarClassificacao({ params }: PageProps<"/admin/classificacao/[id]">) {
  return (
    <Suspense fallback={<Esqueleto cartoes={2} />}>
      <ConteudoEditarClassificacao params={params} />
    </Suspense>
  );
}

async function ConteudoEditarClassificacao({ params }: Pick<PageProps<"/admin/classificacao/[id]">, "params">) {
  const [sessao, config, { id }] = await Promise.all([exigirSessao(), obterConfig(), params]);
  const escalao = sessao.escaloes.find((e) => e.id === id);
  if (!escalao) notFound(); // não existe ou não é dos escalões deste utilizador

  const supabase = await createClient();
  const { data: linhas } = await supabase.from("classificacoes" as any).select("*").eq("escalao_id", id).order("posicao");

  return (
    <>
      <Link href="/admin/classificacao" className="mb-2 inline-block text-sm font-semibold text-clube dark:text-destaque">
        ← Classificação
      </Link>
      <h1 className="text-2xl font-black tracking-tight">{escalao.nome}</h1>
      <p className="mb-5 text-sm text-suave">{escalao.competicao ?? "Classificação"}</p>
      <EditorClassificacao escalaoId={id} iniciais={linhas ?? []} nomesClube={[config.nome_curto, config.nome]} />
    </>
  );
}
