"use client";

import type { JogoCompleto } from "@/lib/dados";
import { aoVivo, desfecho, equipas } from "@/lib/jogos";
import { useJogosAoVivo } from "@/lib/useJogosAoVivo";
import { EstadoJogo } from "./EstadoJogo";
import { NumeroGolos } from "./NumeroGolos";
import { resumoExpulsoes, resumoMarcadores } from "@/lib/marcadores";
import { CartaoVermelho } from "./CartaoVermelho";

/** Marcador grande da página do jogo, atualizado em tempo real. */
export function MarcadorPublico({ jogo: inicial, nomeClube }: { jogo: JogoCompleto; nomeClube: string }) {
  const [jogo] = useJogosAoVivo([inicial]);
  const [casa, fora] = equipas(jogo, nomeClube);
  const temResultado = casa.golos !== null && fora.golos !== null;
  const vivo = aoVivo(jogo.estado);
  const expulsoes = jogo.expulsoes ?? [];
  // Cartões vermelhos de cada equipa, por baixo do nome.
  const vermelhos = (eClube: boolean) => {
    const texto = resumoExpulsoes(expulsoes, eClube ? "clube" : "adversario");
    return texto ? (
      <span className="mt-1 flex items-center justify-center gap-1 text-xs font-semibold" aria-label={`Expulsões: ${texto}`}>
        <CartaoVermelho /> {texto}
      </span>
    ) : null;
  };
  // Marcadores do clube, por baixo do nome do clube (como as expulsões).
  const marcadores = (eClube: boolean) =>
    eClube && jogo.golos.length > 0 ? (
      <span className="mt-1 block text-xs font-semibold text-destaque" aria-label={`Marcadores do ${nomeClube}: ${resumoMarcadores(jogo.golos)}`}>
        <span aria-hidden>⚽</span> {resumoMarcadores(jogo.golos)}
      </span>
    ) : null;

  return (
    <section
      aria-live="polite"
      className={`rounded-2xl bg-clube p-5 text-clube-texto shadow-md ${vivo ? "ring-4 ring-ao-vivo/50" : ""}`}
    >
      <div className="mb-4 flex justify-center">
        <span className="rounded-full bg-superficie px-3 py-1">
          <EstadoJogo estado={jogo.estado} desde={jogo.estado_desde} desfecho={desfecho(jogo)} />
          {jogo.estado === "agendado" && <span className="text-xs font-semibold uppercase text-suave">Agendado</span>}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
        <div>
          <p className={`text-base leading-tight sm:text-lg ${casa.eClube ? "font-black" : "font-semibold"}`}>{casa.nome}</p>
          {marcadores(casa.eClube)}
          {vermelhos(casa.eClube)}
        </div>
        <p className="tabular text-5xl font-black sm:text-6xl" aria-label={temResultado ? `${casa.golos} a ${fora.golos}` : "Ainda sem resultado"}>
          {temResultado ? (
            <>
              <NumeroGolos valor={casa.golos} className="rounded px-1" />
              <span className="opacity-60">–</span>
              <NumeroGolos valor={fora.golos} className="rounded px-1" />
            </>
          ) : (
            <span className="text-3xl opacity-80">vs</span>
          )}
        </p>
        <div>
          <p className={`text-base leading-tight sm:text-lg ${fora.eClube ? "font-black" : "font-semibold"}`}>{fora.nome}</p>
          {marcadores(fora.eClube)}
          {vermelhos(fora.eClube)}
        </div>
      </div>
    </section>
  );
}
