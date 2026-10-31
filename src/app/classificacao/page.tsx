import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { obterClassificacoes, obterEscaloes } from "@/lib/dados";
import { TabelaClassificacao } from "@/components/TabelaClassificacao";
import { Esqueleto, Titulo } from "@/components/Esqueleto";

export const metadata: Metadata = { title: "Classificação" };

export default function PaginaClassificacao() {
  return (
    <>
      <Titulo>Classificação</Titulo>
      <Suspense fallback={<Esqueleto cartoes={2} />}>
        <ConteudoClassificacao />
      </Suspense>
    </>
  );
}

async function ConteudoClassificacao() {
  const [escaloes, linhas] = await Promise.all([obterEscaloes(), obterClassificacoes()]);

  return (
    <>
      <nav aria-label="Escalões" className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {escaloes.map((e) => (
          <a
            key={e.id}
            href={`#${e.slug}`}
            className="flex h-9 shrink-0 items-center rounded-full border border-borda bg-superficie px-4 text-sm font-semibold"
          >
            {e.nome}
          </a>
        ))}
      </nav>
      {escaloes.map((e) => (
        <section key={e.id} id={e.slug} className="mb-8 scroll-mt-20">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">{e.nome}</h2>
              {e.competicao && <p className="text-xs text-suave">{e.competicao}</p>}
            </div>
            <Link href={`/escaloes/${e.slug}`} className="shrink-0 text-sm font-semibold text-clube underline-offset-2 hover:underline dark:text-destaque">
              Jogos do escalão →
            </Link>
          </div>
          <TabelaClassificacao linhas={linhas.filter((l) => l.escalao_id === e.id)} />
        </section>
      ))}
    </>
  );
}
