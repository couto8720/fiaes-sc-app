"use client";

import { useState, useSyncExternalStore } from "react";

// Dica para instalar a app no ecrã principal:
// - Android/Chrome: botão "Instalar" (usa o evento beforeinstallprompt do browser);
// - iPhone/Safari: não há botão possível, por isso explica o caminho Partilhar → Adicionar ao ecrã principal.
// Não aparece se a app já estiver instalada ou se a pessoa a fechou.

type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const CHAVE = "app-clube:dica-instalar-fechada";
let pedidoInstalar: EventoInstalar | null = null;
const ouvintes = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    pedidoInstalar = e as EventoInstalar;
    ouvintes.forEach((f) => f());
  });
  window.addEventListener("appinstalled", () => {
    pedidoInstalar = null;
    ouvintes.forEach((f) => f());
  });
}

export type Plataforma = "android" | "ios" | null;

/** Como se instala a app neste browser ("android" = botão nativo, "ios" = instruções), ou null se não dá/já está instalada. */
export function plataformaInstalar(): Plataforma {
  const instalada =
    window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
  if (instalada) return null;
  if (pedidoInstalar) return "android";
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios|edgios/i.test(navigator.userAgent);
  return ios ? "ios" : null;
}

function lerPlataforma(): Plataforma {
  try {
    if (localStorage.getItem(CHAVE)) return null;
  } catch {}
  return plataformaInstalar();
}

/** Abre a janela de instalação do browser (Android/Chrome). */
export async function pedirInstalacao() {
  await pedidoInstalar?.prompt();
}

export const subscrever = (cb: () => void) => {
  ouvintes.add(cb);
  return () => ouvintes.delete(cb);
};

export function DicaInstalar() {
  const plataforma = useSyncExternalStore(subscrever, lerPlataforma, () => null);
  const [fechada, setFechada] = useState(false);
  if (!plataforma || fechada) return null;

  const fechar = () => {
    try {
      localStorage.setItem(CHAVE, "1");
    } catch {}
    setFechada(true);
  };

  return (
    <aside className="mb-4 flex items-center gap-3 rounded-2xl border border-borda bg-superficie p-3 text-sm shadow-sm">
      <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-clube text-lg text-clube-texto">📲</span>
      <p className="min-w-0 flex-1">
        {plataforma === "android" ? (
          <>Instala a app para abrir os resultados num toque.</>
        ) : (
          <>
            Instala a app: toca em <strong>Partilhar</strong> <span aria-hidden>⎋</span> e depois em{" "}
            <strong>Adicionar ao ecrã principal</strong>.
          </>
        )}
      </p>
      {plataforma === "android" && (
        <button
          type="button"
          onClick={async () => {
            await pedidoInstalar?.prompt();
            fechar();
          }}
          className="h-9 shrink-0 rounded-lg bg-clube px-3 font-semibold text-clube-texto"
        >
          Instalar
        </button>
      )}
      <button type="button" onClick={fechar} aria-label="Fechar dica" className="h-9 w-9 shrink-0 rounded-lg text-lg text-suave">
        ×
      </button>
    </aside>
  );
}
