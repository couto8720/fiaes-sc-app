"use client";

import { useSyncExternalStore } from "react";

// Relógio partilhado que "bate" a cada 30 s; no servidor devolve null (nada é desenhado),
// o que evita diferenças entre o HTML do servidor e o do browser.
const ouvintes = new Set<() => void>();
let relogio: ReturnType<typeof setInterval> | undefined;
let instante = 0;

function subscrever(cb: () => void) {
  ouvintes.add(cb);
  if (!relogio) {
    instante = Date.now();
    relogio = setInterval(() => {
      instante = Date.now();
      ouvintes.forEach((f) => f());
    }, 30_000);
  }
  return () => {
    ouvintes.delete(cb);
    if (!ouvintes.size) {
      clearInterval(relogio);
      relogio = undefined;
    }
  };
}

const lerInstante = () => instante || (instante = Date.now());

export function useAgora() {
  return useSyncExternalStore(subscrever, lerInstante, () => null);
}

/** "há 12 min" desde o início do estado atual (ex.: 2.ª parte). */
export function TempoDesde({ desde }: { desde: string }) {
  const agora = useAgora();
  if (agora === null) return null;
  const minutos = Math.max(0, Math.floor((agora - Date.parse(desde)) / 60_000));
  return <span className="tabular">{minutos < 1 ? "agora" : `há ${minutos} min`}</span>;
}
