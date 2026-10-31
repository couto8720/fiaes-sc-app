import Link from "next/link";
import type { JogoCompleto } from "@/lib/dados";
import { aoVivo, desfecho, equipas, formatarDataHora, formatarHora } from "@/lib/jogos";
import { EstadoJogo } from "./EstadoJogo";
import { NumeroGolos } from "./NumeroGolos";
import { resumoMarcadores } from "@/lib/marcadores";

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

  const titulo = [
    mostrarEscalao && jogo.escalao?.nome,
    jogo.competicao,
    jogo.jornada && `Jornada ${jogo.jornada}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className={`relative rounded-xl border bg-superficie p-4 shadow-sm ${
        vivo ? "border-ao-vivo/60 ring-1 ring-ao-vivo/30" : "border-borda"
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-suave">{titulo}</span>
        <EstadoJogo estado={jogo.estado} desde={jogo.estado_desde} desfecho={desfecho(jogo)} />
      </div>

      <ul className={riscado ? "opacity-60" : undefined}>
        {ladoALado.map((eq) => (
          <li key={eq.nome} className="flex items-center justify-between gap-3 py-0.5">
            <span className={`truncate text-base ${eq.eClube ? "font-bold" : "font-medium"}`}>{eq.nome}</span>
            {temResultado && <NumeroGolos valor={eq.golos} className="tabular rounded px-1.5 text-xl font-black" />}
          </li>
        ))}
      </ul>

      {jogo.golos?.length > 0 && (
        <p className="mt-1.5 text-sm">
          <span aria-label="Marcadores">⚽</span> <span className="font-medium">{resumoMarcadores(jogo.golos, { minutos: false })}</span>
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-suave">
        <span className="tabular">{mostrarDia ? formatarDataHora(jogo.data_hora) : formatarHora(jogo.data_hora)}</span>
        <span>{jogo.em_casa ? "Casa" : "Fora"}</span>
        {jogo.local &&
          (jogo.local.maps_url ? (
            <a
              href={jogo.local.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 inline-flex items-center gap-1 underline decoration-borda underline-offset-2 hover:text-texto"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              {jogo.local.nome}
            </a>
          ) : (
            <span>{jogo.local.nome}</span>
          ))}
      </div>
      {jogo.notas && <p className="mt-2 text-sm italic text-suave">{jogo.notas}</p>}

      {/* O cartão inteiro abre a página do jogo; o link do Maps fica por cima (z-10). */}
      <Link href={`/jogos/${jogo.id}`} className="absolute inset-0 rounded-xl" aria-label={`Ver jogo: ${titulo}`} />
    </article>
  );
}
