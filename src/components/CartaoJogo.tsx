import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { BotaoMapa } from "./BotaoMapa";
import type { JogoCompleto } from "@/lib/dados";
import { aoVivo, desfecho, equipas, formatarDiaEtiqueta, formatarHora } from "@/lib/jogos";
import { EstadoJogo } from "./EstadoJogo";
import { NumeroGolos } from "./NumeroGolos";
import { resumoMarcadores } from "@/lib/marcadores";
import { CartaoVermelho } from "./CartaoVermelho";

// Barra à esquerda: cor do resultado nos jogos terminados; cor do clube nos restantes.
const COR_BORDA = {
  vitoria: "border-l-vitoria",
  empate: "border-l-empate",
  derrota: "border-l-derrota",
  nenhum: "border-l-clube dark:border-l-destaque",
} as const;

export function CartaoJogo({
  jogo,
  nomeClube,
  mostrarEscalao = true,
  mostrarDia = false,
}: {
  jogo: JogoCompleto;
  nomeClube: string;
  mostrarEscalao?: boolean;
  mostrarDia?: boolean;
}) {
  const ladoALado = equipas(jogo, nomeClube);
  const temResultado = jogo.golos_clube !== null && jogo.golos_adversario !== null;
  const vivo = aoVivo(jogo.estado);
  const riscado = jogo.estado === "adiado" || jogo.estado === "cancelado";
  const comEstado = vivo || jogo.estado === "final" || riscado;
  const resultado = desfecho(jogo);

  const titulo = [mostrarEscalao && jogo.escalao?.nome, jogo.competicao, jogo.jornada && `Jornada ${jogo.jornada}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className={`cartao-vivo entrar relative overflow-hidden rounded-2xl border border-l-[6px] bg-superficie p-4 shadow-sm ${
        vivo
          ? "border-ao-vivo/60 border-l-ao-vivo bg-linear-to-r from-ao-vivo/10 to-superficie to-40% ring-1 ring-ao-vivo/30"
          : `border-borda ${COR_BORDA[resultado ?? "nenhum"]}`
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-clube dark:text-destaque">{titulo}</span>
        {comEstado ? (
          <EstadoJogo estado={jogo.estado} desde={jogo.estado_desde} desfecho={resultado} />
        ) : (
          mostrarDia && (
            <span className="shrink-0 rounded bg-destaque/25 px-2 py-0.5 text-xs font-semibold">
              {formatarDiaEtiqueta(jogo.data_hora)}
            </span>
          )
        )}
      </div>

      <ul className={riscado ? "opacity-60" : undefined}>
        {ladoALado.map((eq) => (
          <li key={eq.nome} className="flex items-center justify-between gap-3 py-1">
            <span className="flex min-w-0 items-center gap-1.5">
              <span className={`truncate text-base ${eq.eClube ? "font-bold" : "font-medium"}`}>{eq.nome}</span>
              {/* Um cartão por expulsão dessa equipa */}
              {(jogo.expulsoes ?? [])
                .filter((e) => e.lado === (eq.eClube ? "clube" : "adversario"))
                .map((e, k) => (
                  <CartaoVermelho key={k} className="h-3.5 w-2.5" />
                ))}
              {(jogo.expulsoes ?? []).some((e) => e.lado === (eq.eClube ? "clube" : "adversario")) && (
                <span className="sr-only">(com expulsões)</span>
              )}
            </span>
            {temResultado && (
              <NumeroGolos
                valor={eq.golos}
                className={`tabular grid min-w-9 place-items-center rounded-lg px-1.5 pt-1 font-display text-3xl leading-none font-bold ${
                  eq.eClube ? "bg-clube text-white dark:bg-destaque dark:text-black" : "bg-fundo"
                }`}
              />
            )}
          </li>
        ))}
      </ul>

      {jogo.golos?.length > 0 && (
        <p className="mt-1.5 text-sm">
          <span aria-label="Marcadores">⚽</span> <span className="font-medium">{resumoMarcadores(jogo.golos, { minutos: false })}</span>
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-borda pt-2 text-sm text-suave">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1 tabular">
            <Clock size={14} className="text-clube dark:text-destaque" aria-hidden />
            {comEstado && mostrarDia ? `${formatarDiaEtiqueta(jogo.data_hora)} · ` : ""}
            {formatarHora(jogo.data_hora)}
          </span>
          <span>{jogo.em_casa ? "Casa" : "Fora"}</span>
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin size={14} className="shrink-0 text-clube dark:text-destaque" aria-hidden />
            <span className="truncate">{jogo.local?.nome ?? "Local a definir"}</span>
          </span>
        </div>
        {jogo.local?.maps_url && <BotaoMapa mapsUrl={jogo.local.maps_url} nomeLocal={jogo.local.nome} />}
      </div>
      {jogo.notas && <p className="mt-2 text-sm italic text-suave">{jogo.notas}</p>}

      {/* O cartão inteiro abre a página do jogo; o link do mapa fica por cima (z-10). */}
      <Link href={`/jogos/${jogo.id}`} className="absolute inset-0 rounded-2xl" aria-label={`Ver jogo: ${titulo}`} />
    </article>
  );
}
