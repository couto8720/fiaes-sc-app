"use client";

import type { JogoCompleto } from "@/lib/dados";
import type { Escalao } from "@/lib/supabase/database.types";
import { agruparPorDia, aoVivo, rotuloDia } from "@/lib/jogos";
import { useJogosAoVivo } from "@/lib/useJogosAoVivo";
import { useFiltroEscalao } from "@/lib/useFiltroEscalao";
import { CartaoJogo } from "./CartaoJogo";
import { FiltroEscaloes } from "./FiltroEscaloes";

type Props = {
  jogos: JogoCompleto[];
  nomeClube: string;
  agora: number;
  /** Mostra os chips de filtro (desligado na página de um escalão). */
  escaloes?: Pick<Escalao, "slug" | "nome">[];
  vazio: string;
};

/** Lista de jogos agrupada por dia, com filtro por escalão e atualização em tempo real. */
export function ListaJogos({ jogos, nomeClube, agora, escaloes, vazio }: Props) {
  const vivos = useJogosAoVivo(jogos);
  const filtro = useFiltroEscalao();
  const filtroValido = escaloes?.some((e) => e.slug === filtro) ? filtro : "";
  const visiveis = filtroValido ? vivos.filter((j) => j.escalao?.slug === filtroValido) : vivos;

  return (
    <>
      {escaloes && <FiltroEscaloes escaloes={escaloes} ativo={filtroValido} />}
      {visiveis.length === 0 ? (
        <p className="rounded-xl border border-dashed border-borda p-6 text-center text-suave">{vazio}</p>
      ) : (
        agruparPorDia(visiveis).map(({ dia, jogos: doDia }) => (
          <section key={dia} className="mb-6">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-suave">
              {rotuloDia(doDia[0].data_hora, agora)}
            </h2>
            <div className="space-y-3">
              {doDia.map((j) => (
                <CartaoJogo key={j.id} jogo={j} nomeClube={nomeClube} mostrarEscalao={Boolean(escaloes)} />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}

/** Página inicial: "Ao vivo", "Hoje", "Próximos dias" e "Últimos resultados". */
export function PainelInicio({ jogos, nomeClube, agora, escaloes }: Omit<Props, "vazio">) {
  const vivos = useJogosAoVivo(jogos);
  const filtro = useFiltroEscalao();
  const filtroValido = escaloes?.some((e) => e.slug === filtro) ? filtro : "";
  const visiveis = filtroValido ? vivos.filter((j) => j.escalao?.slug === filtroValido) : vivos;

  const hoje = rotuloDia(new Date(agora).toISOString(), agora);
  const ehHoje = (j: JogoCompleto) => rotuloDia(j.data_hora, agora) === hoje;
  const passou = (j: JogoCompleto) => Date.parse(j.data_hora) < agora;

  const aoVivoAgora = visiveis.filter((j) => aoVivo(j.estado));
  const deHoje = visiveis.filter((j) => !aoVivo(j.estado) && ehHoje(j));
  const proximos = visiveis.filter((j) => !aoVivo(j.estado) && !ehHoje(j) && !passou(j));
  const resultados = visiveis
    .filter((j) => j.estado === "final" && !ehHoje(j) && passou(j))
    .reverse();

  const seccao = (titulo: string, lista: JogoCompleto[], opcoes: { dia?: boolean; destaque?: boolean } = {}) =>
    lista.length > 0 && (
      <section className="mb-7">
        <h2
          className={`mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide ${
            opcoes.destaque ? "text-ao-vivo" : "text-suave"
          }`}
        >
          {opcoes.destaque && <span aria-hidden className="ponto-ao-vivo h-2 w-2 rounded-full bg-ao-vivo" />}
          {titulo}
        </h2>
        <div className="space-y-3">
          {lista.map((j) => (
            <CartaoJogo key={j.id} jogo={j} nomeClube={nomeClube} mostrarDia={opcoes.dia} />
          ))}
        </div>
      </section>
    );

  const nada = !aoVivoAgora.length && !deHoje.length && !proximos.length && !resultados.length;

  return (
    <>
      {escaloes && <FiltroEscaloes escaloes={escaloes} ativo={filtroValido} />}
      {seccao("Ao vivo", aoVivoAgora, { destaque: true })}
      {seccao("Hoje", deHoje)}
      {seccao("Próximos dias", proximos, { dia: true })}
      {seccao("Últimos resultados", resultados, { dia: true })}
      {nada && (
        <p className="rounded-xl border border-dashed border-borda p-6 text-center text-suave">
          Não há jogos nesta semana.
        </p>
      )}
    </>
  );
}
