"use client";

import type { JogoCompleto } from "@/lib/dados";
import type { Escalao } from "@/lib/supabase/database.types";
import { CalendarClock, CalendarDays, History, Radio, type LucideIcon } from "lucide-react";
import { agruparPorDia, agruparPorSemana, rotuloDia } from "@/lib/jogos";
import { useJogosAoVivo } from "@/lib/useJogosAoVivo";
import { useFiltroEscalao } from "@/lib/useFiltroEscalao";
import { useMeusEscaloes } from "@/lib/useMeusEscaloes";
import { filtrarJogos, filtroAtivo } from "@/lib/filtroJogos";
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
  const meus = useMeusEscaloes();
  const filtroValido = filtroAtivo(filtro, escaloes, meus);
  const visiveis = filtrarJogos(vivos, filtroValido, meus);

  return (
    <>
      {escaloes && <FiltroEscaloes escaloes={escaloes} ativo={filtroValido} meus={Boolean(meus?.length)} />}
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

/** Página inicial: "Ao vivo", "Esta semana", "Próxima semana" e "Jogos anteriores" (semanas de segunda a domingo). */
export function PainelInicio({ jogos, nomeClube, agora, escaloes }: Omit<Props, "vazio">) {
  const vivos = useJogosAoVivo(jogos);
  const filtro = useFiltroEscalao();
  const meus = useMeusEscaloes();
  const filtroValido = filtroAtivo(filtro, escaloes, meus);
  const visiveis = filtrarJogos(vivos, filtroValido, meus);
  const g = agruparPorSemana(visiveis, agora);

  const seccao = (titulo: string, Icone: LucideIcon, lista: JogoCompleto[], tom: "vivo" | "destaque" | "normal" | "suave") =>
    lista.length > 0 && (
      <section className="mb-8">
        <h2
          className={`mb-3 flex items-center gap-2 border-b-2 pb-1 font-display text-2xl leading-none font-semibold uppercase tracking-wide ${
            tom === "vivo"
              ? "border-ao-vivo text-ao-vivo"
              : tom === "destaque"
                ? "border-destaque text-texto"
                : tom === "normal"
                  ? "border-clube text-texto dark:border-clube-claro"
                  : "border-borda text-suave"
          }`}
        >
          <Icone size={20} className={tom === "vivo" ? "ponto-ao-vivo" : tom === "suave" ? "" : "text-clube dark:text-destaque"} aria-hidden />
          {titulo}
        </h2>
        <div className="space-y-3">
          {lista.map((j) => (
            <CartaoJogo key={j.id} jogo={j} nomeClube={nomeClube} mostrarDia={tom !== "vivo"} />
          ))}
        </div>
      </section>
    );

  const nada = !g.aoVivo.length && !g.estaSemana.length && !g.proximaSemana.length && !g.anteriores.length;

  return (
    <>
      {escaloes && <FiltroEscaloes escaloes={escaloes} ativo={filtroValido} meus={Boolean(meus?.length)} />}
      {seccao("Ao vivo", Radio, g.aoVivo, "vivo")}
      {seccao("Esta semana", CalendarClock, g.estaSemana, "destaque")}
      {seccao("Próxima semana", CalendarDays, g.proximaSemana, "normal")}
      {seccao("Jogos anteriores", History, g.anteriores, "suave")}
      {nada && (
        <p className="rounded-xl border border-dashed border-borda p-6 text-center text-suave">
          Não há jogos nestas semanas.
        </p>
      )}
    </>
  );
}
