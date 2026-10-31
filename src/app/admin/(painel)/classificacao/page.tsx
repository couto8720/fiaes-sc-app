import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { exigirSessao } from "@/lib/sessao";
import { formatarDiaCurto } from "@/lib/jogos";
import { Esqueleto } from "@/components/Esqueleto";

export const metadata: Metadata = { title: "Classificação" };

export default function PaginaClassificacaoAdmin() {
  return (
    <>
      <h1 className="mb-1 text-2xl font-black tracking-tight">Classificação</h1>
      <p className="mb-4 text-sm text-suave">Atualiza depois de cada jornada, copiando a tabela do site da associação.</p>
      <Suspense fallback={<Esqueleto cartoes={2} />}>
        <ListaClassificacoes />
      </Suspense>
    </>
  );
}

async function ListaClassificacoes() {
  const sessao = await exigirSessao();
  const ids = sessao.escaloes.map((e) => e.id);
  const supabase = await createClient();
  const { data } = ids.length
    ? await supabase.from("classificacoes").select("escalao_id, posicao, e_o_clube, atualizado_em").in("escalao_id", ids)
    : { data: [] };

  if (!ids.length) {
    return <p className="rounded-xl border border-dashed border-borda p-6 text-center text-suave">Ainda não tens escalões atribuídos.</p>;
  }

  return (
    <ul className="divide-y divide-borda overflow-hidden rounded-xl border border-borda bg-superficie">
      {sessao.escaloes.map((e) => {
        const linhas = (data ?? []).filter((l) => l.escalao_id === e.id);
        const clube = linhas.find((l) => l.e_o_clube);
        const ultima = linhas.reduce<string | null>((m, l) => (!m || l.atualizado_em > m ? l.atualizado_em : m), null);
        return (
          <li key={e.id}>
            <Link href={`/admin/classificacao/${e.id}`} className="flex items-center justify-between gap-3 p-3">
              <span className="min-w-0">
                <span className="block font-semibold">{e.nome}</span>
                <span className="block text-sm text-suave">
                  {linhas.length
                    ? `${clube ? `${clube.posicao}.º lugar · ` : ""}${linhas.length} equipas · atualizada ${formatarDiaCurto(ultima!)}`
                    : "Ainda sem classificação"}
                </span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-clube dark:text-destaque">Atualizar →</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
