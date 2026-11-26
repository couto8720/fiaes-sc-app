import type { Metadata } from "next";
import { Award, ExternalLink, History, MapPin, Star, Trophy } from "lucide-react";
import { SIMBOLO_LOCAL } from "@/lib/simbolo";

export const metadata: Metadata = {
  title: "Fiães SC",
  description: "Palmarés, história e certificação do Fiães Sport Clube.",
};

// Informação do site oficial do clube (fiaessc.s7.emjogo.pt): palmarés, história e contactos.
const SITE_OFICIAL = "https://fiaessc.s7.emjogo.pt/pt/";

const PALMARES: { escalao: string; titulos: { nome: string; epocas: string[] }[] }[] = [
  {
    escalao: "Seniores",
    titulos: [
      { nome: "Campeão Distrital da Divisão de Elite AF Aveiro", epocas: ["1989/90", "2001/02"] },
      { nome: "Campeão Distrital da 1.ª Divisão AF Aveiro", epocas: ["1974/75"] },
    ],
  },
  { escalao: "Juniores", titulos: [{ nome: "Campeão Distrital da Divisão de Elite AF Aveiro", epocas: ["2000/01", "2004/05"] }] },
  { escalao: "Juvenis", titulos: [{ nome: "Campeão Distrital da Divisão de Elite AF Aveiro", epocas: ["1990/91", "2011/12"] }] },
  { escalao: "Iniciados", titulos: [{ nome: "Campeão Distrital da Divisão de Elite AF Aveiro", epocas: ["2013/14"] }] },
];

const TOTAL_TITULOS = PALMARES.flatMap((p) => p.titulos).reduce((n, t) => n + t.epocas.length, 0);

const HISTORIA: { quando: string; texto: string }[] = [
  { quando: "Anos 20", texto: "A população de Fiães começa a querer um clube de futebol na terra." },
  {
    quando: "1931",
    texto:
      "Forma-se uma comissão, com autorização da Junta de Freguesia, e desbravam-se oito hectares de baldios no Bolhão. Os lavradores que usavam a água do Bolhão opõem-se e o caso chega a tribunal.",
  },
  {
    quando: "1932",
    texto:
      "Fundação do Fiães Sport Clube, no primeiro semestre (diz-se que em abril). O primeiro presidente, Manuel Pinto, acabado de regressar do Brasil, dá ao clube as cores verde e amarela.",
  },
  { quando: "1933", texto: "Aprovação dos estatutos e filiação no campeonato de promoção da AF Aveiro." },
  {
    quando: "1939",
    texto: "Depois de um jogo com o Lusitânia de Lourosa, incidentes entre adeptos destroem a vedação e a bancada. O clube fecha portas.",
  },
  { quando: "1972", texto: "Com uma nova direção, o Fiães SC volta à atividade." },
  { quando: "1974/75", texto: "Campeão da 1.ª Divisão Distrital da AF Aveiro." },
  { quando: "1989/90", texto: "Primeiro título de Campeão Distrital da Divisão de Elite da AF Aveiro." },
  { quando: "2001/02", texto: "Segundo título de Campeão da Divisão de Elite. No mesmo ano, final da Taça da AF Aveiro (derrota por 0-1)." },
  { quando: "2018/19", texto: "Nova final da Taça da AF Aveiro, perdida por 2-1." },
];

const MARCOS = [
  "Um dos fundadores da Divisão de Elite da AF Aveiro, onde joga desde a primeira época",
  "Melhor classificação nacional: 7.º lugar na Segunda Divisão (3.º escalão)",
  "Chegou aos 16 avos de final da Taça de Portugal, eliminado nos penáltis pelo Marítimo",
];

export default function PaginaClube() {
  return (
    <div className="space-y-10">
      {/* Apresentação */}
      <section className="fundo-estadio entrar relative overflow-hidden rounded-3xl px-6 pt-16 pb-6 text-white shadow-xl">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:text-left">
          {/* eslint-disable-next-line @next/next/no-img-element -- símbolo incluído na app */}
          <img src={SIMBOLO_LOCAL} alt="Símbolo do Fiães Sport Clube" width={96} height={116} className="h-28 w-auto drop-shadow-[0_6px_18px_rgb(0_0_0/0.55)]" />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-destaque">Desde 1932</p>
            <h1 className="font-display text-5xl leading-none font-semibold uppercase tracking-wide">Fiães Sport Clube</h1>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/85">
              <MapPin size={15} aria-hidden /> Estádio do Bolhão · Fiães, Santa Maria da Feira
            </p>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-3 gap-2 text-center">
          {[
            [String(TOTAL_TITULOS), "Títulos"],
            ["1932", "Fundação"],
            ["5 700", "Lugares"],
          ].map(([valor, rotulo]) => (
            <div key={rotulo} className="rounded-xl bg-black/30 px-2 py-2 backdrop-blur-sm">
              <dt className="sr-only">{rotulo}</dt>
              <dd className="font-display text-3xl leading-none font-bold text-destaque">{valor}</dd>
              <dd className="text-xs font-semibold uppercase tracking-wide text-white/80">{rotulo}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Entidade formadora */}
      <section aria-labelledby="titulo-formadora" className="entrar flex items-center gap-4 rounded-2xl border border-destaque/60 bg-destaque/10 p-5">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-clube text-destaque shadow-md">
          <Award size={32} aria-hidden />
        </div>
        <div className="min-w-0">
          <h2 id="titulo-formadora" className="font-display text-2xl leading-none font-semibold uppercase tracking-wide">
            Entidade Formadora Certificada
          </h2>
          <p className="mt-1 flex items-center gap-0.5 text-destaque-escuro dark:text-destaque" aria-label="3 estrelas">
            {[0, 1, 2].map((i) => (
              <Star key={i} size={20} fill="currentColor" aria-hidden />
            ))}
            <span className="ml-2 text-sm font-bold text-texto">3 estrelas</span>
          </p>
          <p className="mt-1 text-sm text-suave">
            O clube é reconhecido como entidade formadora certificada de 3 estrelas, pela qualidade do trabalho na formação dos jovens jogadores.
          </p>
        </div>
      </section>

      {/* Palmarés */}
      <section aria-labelledby="titulo-palmares">
        <h2 id="titulo-palmares" className="mb-4 flex items-center gap-2 border-b-2 border-destaque pb-1 font-display text-3xl leading-none font-semibold uppercase tracking-wide">
          <Trophy size={24} className="text-clube dark:text-destaque" aria-hidden />
          Palmarés
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {PALMARES.map(({ escalao, titulos }) => (
            <article key={escalao} className="cartao-vivo entrar rounded-2xl border border-borda bg-superficie p-4 shadow-sm">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-clube dark:text-destaque">{escalao}</h3>
              <ul className="space-y-3">
                {titulos.map((t) => (
                  <li key={t.nome} className="flex gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-destaque pt-1 font-display text-2xl font-bold text-black">
                      {t.epocas.length}×
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold leading-snug">{t.nome}</p>
                      <p className="mt-1 flex flex-wrap gap-1">
                        {t.epocas.map((e) => (
                          <span key={e} className="rounded bg-fundo px-1.5 py-0.5 text-xs font-semibold tabular text-suave">
                            {e}
                          </span>
                        ))}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* História */}
      <section aria-labelledby="titulo-historia">
        <h2 id="titulo-historia" className="mb-4 flex items-center gap-2 border-b-2 border-clube pb-1 font-display text-3xl leading-none font-semibold uppercase tracking-wide dark:border-clube-claro">
          <History size={24} className="text-clube dark:text-destaque" aria-hidden />
          História
        </h2>
        <ol className="relative ml-3 space-y-5 border-l-2 border-clube/30 dark:border-destaque/30">
          {HISTORIA.map(({ quando, texto }) => (
            <li key={quando} className="relative pl-6">
              <span aria-hidden className="absolute top-1 -left-[9px] h-4 w-4 rounded-full border-2 border-superficie bg-clube ring-2 ring-clube/30 dark:bg-destaque dark:ring-destaque/30" />
              <p className="font-display text-2xl leading-none font-semibold text-clube dark:text-destaque">{quando}</p>
              <p className="mt-1 text-sm leading-relaxed">{texto}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 rounded-2xl border border-borda bg-superficie p-4">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-suave">Marcos do clube</h3>
          <ul className="space-y-1.5 text-sm">
            {MARCOS.map((m) => (
              <li key={m} className="flex gap-2">
                <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-destaque" />
                {m}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <p className="text-center text-xs text-suave">
        Palmarés e história:{" "}
        <a href={SITE_OFICIAL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold hover:underline">
          site oficial do Fiães SC <ExternalLink size={12} aria-hidden />
        </a>
      </p>
    </div>
  );
}
