"use client";

import { useSyncExternalStore } from "react";

// Escalão escolhido nos chips de filtro, guardado no browser (um pai quer ver sempre o do filho).
// "" = todos. No servidor é sempre "todos", para o HTML inicial ser igual para toda a gente.
const CHAVE = "app-clube:escalao";
const ouvintes = new Set<() => void>();

function ler() {
  try {
    return localStorage.getItem(CHAVE) ?? "";
  } catch {
    return "";
  }
}

function subscrever(cb: () => void) {
  ouvintes.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    ouvintes.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function definirFiltroEscalao(slug: string) {
  try {
    if (slug) localStorage.setItem(CHAVE, slug);
    else localStorage.removeItem(CHAVE);
  } catch {
    // Navegação privada ou armazenamento bloqueado: o filtro só não fica guardado.
  }
  ouvintes.forEach((f) => f());
}

export function useFiltroEscalao() {
  return useSyncExternalStore(subscrever, ler, () => "");
}
