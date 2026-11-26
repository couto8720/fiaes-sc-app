import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import type { JogoCompleto } from "@/lib/dados";
import { aoVivo, equipas, formatarHora, rotuloDia } from "@/lib/jogos";
import { EstadoJogo } from "./EstadoJogo";
import { NumeroGolos } from "./NumeroGolos";

/** Iniciais de uma equipa ("Académico Norte" → "AN"). */
function iniciais(nome: string) {
  const palavras = nome.split(/\s+/).filter((p) => p.length > 2 || /^[A-Z]{2,}$/.test(p));
  return (palavras.length ? palavras : nome.split(/\s+/))
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

/** Cartão grande no topo da página inicial: o jogo ao vivo ou o próximo jogo. */
export function DestaqueJogo({ jogo, nomeClube, agora }: { jogo: JogoCompleto; nomeClube: string; agora: number }) {
  const vivo = aoVivo(jogo.estado);
  const [casa, fora] = equipas(jogo, nomeClube);
  const temResultado = jogo.golos_clube !== null && jogo.golos_adversario !== null;
  const titulo = [jogo.escalao?.nome, jogo.competicao, jogo.jornada && `Jornada ${jogo.jornada}`].filter(Boolean).join(" · ");

  const equipa = (eq: typeof casa) => (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
      <span
        aria-hidden
        className={`grid h-14 w-14 place-items-center rounded-full pt-1 font-display text-2xl font-bold shadow-lg ring-2 sm:h-16 sm:w-16 ${
          eq.eClube ? "bg-destaque text-black ring-white/70" : "bg-white/15 text-white ring-white/25"
        }`}
      >
        {iniciais(eq.nome)}
      </span>
      <span className={`line-clamp-2 text-sm leading-tight sm:text-base ${eq.eClube ? "font-bold" : "font-medium text-white/90"}`}>
        {eq.nome}
      </span>
    </div>
  );

  return (
    <section className="entrar relative mb-8 overflow-hidden rounded-3xl text-white shadow-xl shadow-clube/20 relvado">
      <div className="relative px-5 pt-4 pb-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="rounded-full bg-black/25 px-3 py-1 text-xs font-bold uppercase tracking-wider text-destaque backdrop-blur-sm">
            {vivo ? "A decorrer" : "Próximo jogo"}
          </span>
          {vivo ? (
            <span className="rounded-full bg-white/90 px-2.5 py-1">
              <EstadoJogo estado={jogo.estado} desde={jogo.estado_desde} />
            </span>
          ) : (
            <span className="truncate text-xs font-semibold uppercase tracking-wide text-white/75">{titulo}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {equipa(casa)}
          <div className="flex shrink-0 flex-col items-center px-1">
            {temResultado ? (
              <div className="flex items-center gap-2 font-display text-6xl leading-none font-bold tabular">
                <NumeroGolos valor={casa.golos} className="rounded-lg px-1" />
                <span className="text-white/50">–</span>
                <NumeroGolos valor={fora.golos} className="rounded-lg px-1" />
              </div>
            ) : (
              <>
                <span className="font-display text-5xl leading-none font-bold tabular">{formatarHora(jogo.data_hora)}</span>
                <span className="mt-1 text-xs font-semibold uppercase tracking-wide text-destaque">
                  {rotuloDia(jogo.data_hora, agora)}
                </span>
              </>
            )}
          </div>
          {equipa(fora)}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-white/80">
          {vivo && <span className="font-semibold uppercase tracking-wide text-white/75">{titulo}</span>}
          {temResultado && (
            <span className="inline-flex items-center gap-1">
              <Clock size={14} aria-hidden />
              {formatarHora(jogo.data_hora)}
            </span>
          )}
          <span className="rounded bg-white/15 px-2 py-0.5 text-xs font-bold uppercase">{jogo.em_casa ? "Casa" : "Fora"}</span>
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin size={14} className="shrink-0" aria-hidden />
            <span className="truncate">{jogo.local?.nome ?? "Local a definir"}</span>
          </span>
        </div>
      </div>
      <Link href={`/jogos/${jogo.id}`} className="absolute inset-0 rounded-3xl" aria-label={`Ver jogo: ${casa.nome} contra ${fora.nome}`} />
    </section>
  );
}
