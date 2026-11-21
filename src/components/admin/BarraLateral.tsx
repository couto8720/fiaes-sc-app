"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { Menu } from "lucide-react";

const CHAVE = "painel-barra-aberta";
const EVENTO = "painel-barra-mudou";
const ECRA_PEQUENO = "(max-width: 767px)";

// Escolha guardada no browser ("1" aberta, "0" fechada; null = nunca escolheu).
function subscreverEscolha(avisar: () => void) {
  window.addEventListener(EVENTO, avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener(EVENTO, avisar);
    window.removeEventListener("storage", avisar);
  };
}
const lerEscolha = () => localStorage.getItem(CHAVE);

function subscreverEcra(avisar: () => void) {
  const m = window.matchMedia(ECRA_PEQUENO);
  m.addEventListener("change", avisar);
  return () => m.removeEventListener("change", avisar);
}
const ecraPequeno = () => window.matchMedia(ECRA_PEQUENO).matches;

/** Barra lateral do painel que abre e fecha com o botão ☰ (a escolha fica guardada no browser). */
export function BarraLateral({ children }: { children: ReactNode }) {
  const escolha = useSyncExternalStore(subscreverEscolha, lerEscolha, () => null);
  const pequeno = useSyncExternalStore(subscreverEcra, ecraPequeno, () => false);
  // Sem escolha guardada: aberta em computador, fechada em telemóvel.
  const aberta = escolha !== null ? escolha === "1" : !pequeno;

  function alternar() {
    localStorage.setItem(CHAVE, aberta ? "0" : "1");
    window.dispatchEvent(new Event(EVENTO));
  }

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-borda bg-superficie transition-[width] duration-200 ${
        aberta ? "w-64 p-4" : "w-14 items-center px-2 py-4"
      }`}
    >
      <button
        type="button"
        onClick={alternar}
        aria-expanded={aberta}
        aria-label={aberta ? "Fechar menu" : "Abrir menu"}
        title={aberta ? "Fechar menu" : "Abrir menu"}
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg text-suave transition hover:bg-fundo hover:text-texto ${
          aberta ? "self-start" : ""
        }`}
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>
      {aberta && <div className="flex min-h-0 flex-1 flex-col">{children}</div>}
    </aside>
  );
}
