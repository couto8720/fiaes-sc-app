"use client";

import Link from "next/link";
import { useState } from "react";
import type { Jogo } from "@/lib/supabase/database.types";
import { ROTULO_ESTADO, aoVivo, equipas, formatarHora } from "@/lib/jogos";
import { ACAO_SEGUINTE, ESTADO_ANTERIOR, marcarGolo, mudarEstado, podeMarcar, type Lado } from "@/lib/marcador";
import { useEcraLigado, useGravacaoMarcador, type EstadoGravacao } from "@/lib/useGravacaoMarcador";
import { TempoDesde } from "../TempoDesde";
import { GestorGolos } from "./GestorGolos";
import type { GoloLinha } from "@/lib/supabase/database.types";

type Props = {
  jogo: Jogo;
  nomeClube: string;
  escalao: string;
  local: string | null;
  golos: Pick<GoloLinha, "id" | "marcador" | "minuto" | "penalti">[];
  sugestoes: string[];
};

const vibrar = () => {
  try {
    navigator.vibrate?.(30);
  } catch {}
};

export function Marcador({ jogo, nomeClube, escalao, local, golos, sugestoes }: Props) {
  const { valores, estadoDesde, gravacao, alterar, tentarJa } = useGravacaoMarcador(jogo);
  // Cada golo do clube pede o nome do marcador (campo "Quem marcou?" logo abaixo).
  const [pedidoMarcador, setPedidoMarcador] = useState(0);
  useEcraLigado();

  const lados = equipas({ ...jogo, ...valores }, nomeClube).map((eq) => ({
    ...eq,
    lado: (eq.eClube ? "clube" : "adversario") as Lado,
  }));
  const acao = ACAO_SEGUINTE[valores.estado];
  const anterior = ESTADO_ANTERIOR[valores.estado];
  const marcar = podeMarcar(valores.estado);
  const bloqueado = gravacao === "sem-permissao";

  const golo = (lado: Lado, delta: 1 | -1) => {
    const novo = marcarGolo(valores, lado, delta);
    if (novo) {
      if (delta > 0) vibrar();
      alterar(novo);
      if (delta > 0 && lado === "clube") setPedidoMarcador((n) => n + 1);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-3 flex items-center justify-between gap-3 text-sm">
        <Link href="/admin" className="font-semibold text-clube dark:text-destaque">← Jogos</Link>
        <IndicadorGravacao estado={gravacao} tentarJa={tentarJa} />
      </div>

      <p className="text-center text-xs font-semibold uppercase tracking-wide text-suave">
        {[escalao, jogo.jornada && `J${jogo.jornada}`, formatarHora(jogo.data_hora), local].filter(Boolean).join(" · ")}
      </p>

      {/* Estado atual */}
      <div className="my-3 flex justify-center">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold uppercase ${
            aoVivo(valores.estado) ? "bg-ao-vivo/15 text-ao-vivo" : "bg-borda text-suave"
          }`}
        >
          {aoVivo(valores.estado) && <span aria-hidden className="ponto-ao-vivo h-2 w-2 rounded-full bg-ao-vivo" />}
          {ROTULO_ESTADO[valores.estado]}
          {aoVivo(valores.estado) && valores.estado !== "intervalo" && (
            <span className="font-medium normal-case">· <TempoDesde desde={estadoDesde} /></span>
          )}
        </span>
      </div>

      {/* Marcador: uma coluna por equipa (casa à esquerda) */}
      <div className="grid grid-cols-2 gap-3" aria-live="polite">
        {lados.map((eq) => (
          <div
            key={eq.lado}
            className={`flex flex-col items-center rounded-2xl border p-3 ${
              eq.eClube ? "border-clube bg-clube/5 dark:border-destaque dark:bg-destaque/5" : "border-borda bg-superficie"
            }`}
          >
            <p className={`line-clamp-2 min-h-10 text-center text-sm leading-tight ${eq.eClube ? "font-black" : "font-semibold"}`}>
              {eq.nome}
            </p>
            <p className="tabular my-1 text-7xl font-black" aria-label={`${eq.nome}: ${eq.golos ?? 0} golos`}>
              {eq.golos ?? "–"}
            </p>
            <button
              type="button"
              onClick={() => golo(eq.lado, 1)}
              disabled={!marcar || bloqueado}
              aria-label={`Golo de ${eq.nome}`}
              className="h-20 w-full rounded-2xl bg-clube text-4xl font-black text-clube-texto shadow-sm active:scale-[0.97] disabled:opacity-30"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => golo(eq.lado, -1)}
              disabled={!marcar || bloqueado || !eq.golos}
              aria-label={`Retirar golo de ${eq.nome}`}
              className="mt-2 h-12 w-full rounded-xl border border-borda bg-superficie text-2xl font-bold active:scale-[0.97] disabled:opacity-30"
            >
              −
            </button>
          </div>
        ))}
      </div>
      {!marcar && valores.estado === "agendado" && (
        <p className="mt-2 text-center text-sm text-suave">Começa o jogo para poderes marcar golos.</p>
      )}

      {/* Ação principal: estado seguinte */}
      {acao ? (
        <button
          type="button"
          disabled={bloqueado}
          onClick={() => {
            if (acao.confirmar && !window.confirm(acao.confirmar)) return;
            alterar(mudarEstado(valores, acao.seguinte));
          }}
          className={`mt-5 h-16 w-full rounded-2xl text-lg font-bold shadow-sm active:scale-[0.99] disabled:opacity-40 ${
            acao.seguinte === "final" ? "bg-texto text-fundo" : "bg-ao-vivo text-white"
          }`}
        >
          ▶ {acao.rotulo}
        </button>
      ) : (
        <p className="mt-5 rounded-2xl bg-borda/60 p-4 text-center font-semibold">
          {valores.estado === "final" ? "Jogo terminado. O resultado já está no site." : `Jogo ${ROTULO_ESTADO[valores.estado].toLowerCase()}.`}
        </p>
      )}

      {/* Marcadores do clube: depois de cada golo, o cursor vai para "Quem marcou?" */}
      {marcar && (
        <div className="mt-4">
          <GestorGolos
            jogoId={jogo.id}
            iniciais={golos}
            sugestoes={sugestoes}
            golosClube={valores.golos_clube}
            pedido={pedidoMarcador}
            nomeClube={nomeClube}
          />
        </div>
      )}

      {/* Opções secundárias: corrigir enganos, adiar, cancelar */}
      <details className="mt-4 rounded-2xl border border-borda bg-superficie">
        <summary className="cursor-pointer p-4 font-semibold">Outras opções</summary>
        <div className="grid gap-2 px-4 pb-4">
          {anterior && (
            <button
              type="button"
              disabled={bloqueado}
              onClick={() => alterar(mudarEstado(valores, anterior))}
              className="h-12 rounded-xl border border-borda font-semibold disabled:opacity-40"
            >
              ↶ Voltar a “{ROTULO_ESTADO[anterior]}”
            </button>
          )}
          {valores.estado === "agendado" &&
            (["adiado", "cancelado"] as const).map((e) => (
              <button
                key={e}
                type="button"
                disabled={bloqueado}
                onClick={() => {
                  if (window.confirm(`Marcar o jogo como ${ROTULO_ESTADO[e].toLowerCase()}?`)) alterar(mudarEstado(valores, e));
                }}
                className="h-12 rounded-xl border border-borda font-semibold disabled:opacity-40"
              >
                Marcar como {ROTULO_ESTADO[e].toLowerCase()}
              </button>
            ))}
          <Link href={`/admin/jogos/${jogo.id}`} className="flex h-12 items-center justify-center rounded-xl font-semibold text-suave">
            Editar dados do jogo (hora, local…)
          </Link>
        </div>
      </details>
    </div>
  );
}

function IndicadorGravacao({ estado, tentarJa }: { estado: EstadoGravacao; tentarJa: () => void }) {
  if (estado === "guardado") return <span className="font-semibold text-vitoria">✓ Guardado</span>;
  if (estado === "a-gravar") return <span className="font-semibold text-suave">A gravar…</span>;
  if (estado === "sem-permissao") {
    return <span role="alert" className="font-semibold text-derrota">Sem permissão para este jogo</span>;
  }
  return (
    <button type="button" onClick={tentarJa} role="alert" className="rounded-lg bg-empate/15 px-2 py-1 font-semibold text-empate">
      Sem rede · a tentar de novo ↻
    </button>
  );
}
