"use client";

import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import type { JogoCompleto } from "@/lib/dados";
import type { Escalao } from "@/lib/supabase/database.types";
import { agruparPorDia, aoVivo, chaveDia, equipas, formatarHora } from "@/lib/jogos";
import { useJogosAoVivo } from "@/lib/useJogosAoVivo";
import { useFiltroEscalao } from "@/lib/useFiltroEscalao";
import { useMeusEscaloes } from "@/lib/useMeusEscaloes";
import { filtrarJogos, filtroAtivo } from "@/lib/filtroJogos";
import { FiltroEscaloes } from "./FiltroEscaloes";
import { EstadoJogo } from "./EstadoJogo";

const FUSO = "Europe/Lisbon";
const fmtMes = new Intl.DateTimeFormat("pt-PT", { timeZone: FUSO, month: "long", year: "numeric" });
const fmtSemana = new Intl.DateTimeFormat("pt-PT", { timeZone: FUSO, weekday: "short" });
const fmtMesCurto = new Intl.DateTimeFormat("pt-PT", { timeZone: FUSO, month: "short" });

const maiuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const DIA_MS = 86_400_000;

type Props = {
  jogos: JogoCompleto[];
  nomeClube: string;
  agora: number;
  escaloes: Pick<Escalao, "slug" | "nome">[];
};

/** Calendário em forma de agenda: mês → dia → jogos, com filtro por escalão. */
export function AgendaJogos({ jogos, nomeClube, agora, escaloes }: Props) {
  const vivos = useJogosAoVivo(jogos);
  const filtro = useFiltroEscalao();
  const meus = useMeusEscaloes();
  const filtroValido = filtroAtivo(filtro, escaloes, meus);
  const visiveis = filtrarJogos(vivos, filtroValido, meus);

  // Agrupar os dias por mês ("Novembro de 2026").
  const meses: { mes: string; dias: ReturnType<typeof agruparPorDia<JogoCompleto>> }[] = [];
  for (const d of agruparPorDia(visiveis)) {
    const mes = maiuscula(fmtMes.format(new Date(d.jogos[0].data_hora)));
    const ultimo = meses.at(-1);
    if (ultimo?.mes === mes) ultimo.dias.push(d);
    else meses.push({ mes, dias: [d] });
  }

  const hoje = chaveDia(agora);
  const amanha = chaveDia(agora + DIA_MS);

  return (
    <>
      <FiltroEscaloes escaloes={escaloes} ativo={filtroValido} meus={Boolean(meus?.length)} />

      {visiveis.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-borda p-8 text-center text-suave">
          Nenhum jogo marcado nos próximos 30 dias.
        </p>
      ) : (
        meses.map(({ mes, dias }) => (
          <section key={mes} className="mb-8">
            <h2 className="mb-3 flex items-center gap-3 font-display text-2xl leading-none font-semibold uppercase tracking-wide">
              {mes}
              <span className="h-0.5 flex-1 rounded bg-linear-to-r from-destaque to-transparent" aria-hidden />
            </h2>

            <ol className="space-y-4">
              {dias.map(({ dia, jogos: doDia }) => {
                const iso = doDia[0].data_hora;
                const eHoje = dia === hoje;
                const etiqueta = eHoje ? "Hoje" : dia === amanha ? "Amanhã" : null;
                return (
                  <li key={dia} className="entrar flex gap-3 sm:gap-4">
                    {/* Bloco da data */}
                    <div
                      className={`flex w-14 shrink-0 flex-col items-center self-start rounded-2xl py-2 shadow-sm sm:w-20 ${
                        eHoje ? "bg-destaque text-black" : "bg-clube text-white"
                      }`}
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                        {fmtSemana.format(new Date(iso)).replace(".", "")}
                      </span>
                      <span className="pt-1 font-display text-4xl leading-none font-bold">{Number(dia.slice(8))}</span>
                      <span className="text-[11px] font-semibold uppercase opacity-80">
                        {fmtMesCurto.format(new Date(iso)).replace(".", "")}
                      </span>
                    </div>

                    {/* Jogos do dia */}
                    <div className="min-w-0 flex-1 space-y-2">
                      {etiqueta && (
                        <span className="inline-block rounded-full bg-destaque/25 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide">
                          {etiqueta}
                        </span>
                      )}
                      {doDia.map((j) => (
                        <LinhaJogo key={j.id} jogo={j} nomeClube={nomeClube} />
                      ))}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))
      )}
    </>
  );
}

function LinhaJogo({ jogo, nomeClube }: { jogo: JogoCompleto; nomeClube: string }) {
  const [casa, fora] = equipas(jogo, nomeClube);
  const vivo = aoVivo(jogo.estado);
  const riscado = jogo.estado === "adiado" || jogo.estado === "cancelado";

  return (
    <Link
      href={`/jogos/${jogo.id}`}
      className={`cartao-vivo group flex items-center gap-3 rounded-2xl border bg-superficie p-3 shadow-sm sm:gap-4 sm:p-4 ${
        vivo ? "border-ao-vivo/60 ring-1 ring-ao-vivo/30" : "border-borda"
      }`}
    >
      {/* Hora */}
      <div className="w-14 shrink-0 border-r border-borda pr-3 text-center sm:w-16">
        <span className={`block pt-1 font-display text-2xl leading-none font-bold tabular ${riscado ? "text-suave line-through" : ""}`}>
          {formatarHora(jogo.data_hora)}
        </span>
        <span
          className={`mt-1 inline-block rounded px-1.5 text-[10px] font-bold uppercase ${
            jogo.em_casa ? "bg-clube/10 text-clube dark:bg-destaque/15 dark:text-destaque" : "bg-fundo text-suave"
          }`}
        >
          {jogo.em_casa ? "Casa" : "Fora"}
        </span>
      </div>

      {/* Equipas e detalhes */}
      <div className={`min-w-0 flex-1 ${riscado ? "opacity-60" : ""}`}>
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          {jogo.escalao && (
            <span className="rounded-full bg-clube px-2 py-0.5 text-[11px] font-bold uppercase text-white dark:bg-destaque dark:text-black">
              {jogo.escalao.nome}
            </span>
          )}
          {jogo.competicao && <span className="truncate text-xs font-semibold text-suave">{jogo.competicao}</span>}
          {(vivo || riscado) && <EstadoJogo estado={jogo.estado} desde={jogo.estado_desde} />}
        </div>
        {/* Telemóvel: uma equipa por linha; ecrãs maiores: "Casa vs Fora" numa linha. */}
        <p className="flex min-w-0 flex-col leading-snug sm:flex-row sm:items-baseline">
          <span className={`truncate ${casa.eClube ? "font-bold" : "font-medium"}`}>{casa.nome}</span>
          <span className="hidden px-1.5 text-sm text-suave sm:inline">vs</span>
          <span className={`truncate ${fora.eClube ? "font-bold" : "font-medium"}`}>{fora.nome}</span>
        </p>
        <p className="mt-0.5 flex min-w-0 items-center gap-1 text-sm text-suave">
          <MapPin size={13} className="shrink-0 text-clube dark:text-destaque" aria-hidden />
          <span className="truncate">{jogo.local?.nome ?? "Local a definir"}</span>
        </p>
      </div>

      <ChevronRight size={18} className="shrink-0 text-suave transition group-hover:translate-x-0.5 group-hover:text-texto" aria-hidden />
    </Link>
  );
}
