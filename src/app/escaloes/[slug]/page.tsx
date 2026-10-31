import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { agora, obterClassificacoes, obterConfig, obterEscalao, obterJogos } from "@/lib/dados";
import { chaveDia } from "@/lib/jogos";
import { ListaJogos } from "@/components/ListaJogos";
import { TabelaClassificacao } from "@/components/TabelaClassificacao";
import { Abas } from "@/components/Abas";
import { Esqueleto } from "@/components/Esqueleto";
import { TabelaMarcadores } from "@/components/TabelaMarcadores";
import { melhoresMarcadores } from "@/lib/marcadores";

type Props = PageProps<"/escaloes/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const escalao = await obterEscalao((await params).slug);
  return escalao
    ? { title: escalao.nome, description: `Calendário, resultados e classificação — ${escalao.nome}.` }
    : { title: "Escalão não encontrado" };
}

export default function PaginaEscalao({ params }: Props) {
  return (
    <Suspense fallback={<Esqueleto />}>
      <ConteudoEscalao params={params} />
    </Suspense>
  );
}

async function ConteudoEscalao({ params }: Pick<Props, "params">) {
  const escalao = await obterEscalao((await params).slug);
  if (!escalao) notFound();

  const t = await agora();
  const [config, jogos, classificacao] = await Promise.all([
    obterConfig(),
    obterJogos({ escalaoId: escalao.id }),
    obterClassificacoes(escalao.id),
  ]);
  const hoje = chaveDia(t);
  const proximos = jogos.filter((j) => chaveDia(j.data_hora) >= hoje);
  const resultados = jogos.filter((j) => j.estado === "final" && chaveDia(j.data_hora) < hoje).reverse();
  const clube = classificacao.find((l) => l.e_o_clube);

  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-black tracking-tight">{escalao.nome}</h1>
          <p className="text-sm text-suave">{[escalao.competicao, escalao.epoca].filter(Boolean).join(" · ")}</p>
        </div>
        {clube && (
          <div className="shrink-0 rounded-xl bg-clube px-3 py-2 text-center text-clube-texto" title={`Classificação do ${config.nome_curto}`}>
            <p className="text-2xl leading-none font-black">{clube.posicao}.º</p>
            <p className="text-xs font-semibold text-destaque">{clube.pontos} pts</p>
          </div>
        )}
      </div>
      <Abas
        abas={[
          {
            id: "proximos",
            rotulo: "Próximos",
            conteudo: <ListaJogos jogos={proximos} nomeClube={config.nome_curto} agora={t} vazio="Não há jogos marcados." />,
          },
          {
            id: "resultados",
            rotulo: "Resultados",
            conteudo: <ListaJogos jogos={resultados} nomeClube={config.nome_curto} agora={t} vazio="Ainda não há resultados." />,
          },
          { id: "classificacao", rotulo: "Tabela", conteudo: <TabelaClassificacao linhas={classificacao} /> },
          {
            id: "marcadores",
            rotulo: "Marcadores",
            conteudo: <TabelaMarcadores linhas={melhoresMarcadores(jogos.flatMap((j) => j.golos))} />,
          },
        ]}
      />
    </>
  );
}
