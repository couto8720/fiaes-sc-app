"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { EVENTO_ABRIR_MENU } from "@/components/navegacao";

const CHAVE = "painel-barra-aberta";
const EVENTO = "painel-barra-mudou";

// Escolha guardada no browser para o computador ("1" aberta, "0" fechada; null = nunca escolheu → aberta).
function subscreverEscolha(avisar: () => void) {
  window.addEventListener(EVENTO, avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener(EVENTO, avisar);
    window.removeEventListener("storage", avisar);
  };
}
const lerEscolha = () => localStorage.getItem(CHAVE);

/**
 * Barra lateral do painel.
 * - Computador (≥768px): fixa à esquerda, abre e fecha com ☰ (a escolha fica guardada no browser).
 * - Telemóvel: o painel usa a largura toda e o menu desliza da esquerda com o ☰ do cabeçalho.
 */
export function BarraLateral({ children }: { children: ReactNode }) {
  const escolha = useSyncExternalStore(subscreverEscolha, lerEscolha, () => null);
  const aberta = escolha !== "0";
  const [movelAberto, setMovelAberto] = useState(false);

  // O ☰ do cabeçalho (telemóvel) abre o menu deslizante.
  useEffect(() => {
    const abrir = () => setMovelAberto(true);
    window.addEventListener(EVENTO_ABRIR_MENU, abrir);
    return () => window.removeEventListener(EVENTO_ABRIR_MENU, abrir);
  }, []);

  // Menu deslizante aberto: Esc fecha e a página por trás não faz scroll.
  useEffect(() => {
    if (!movelAberto) return;
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && setMovelAberto(false);
    window.addEventListener("keydown", tecla);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", tecla);
      document.body.style.overflow = overflow;
    };
  }, [movelAberto]);

  function alternar() {
    localStorage.setItem(CHAVE, aberta ? "0" : "1");
    window.dispatchEvent(new Event(EVENTO));
  }

  return (
    <>
      {/* Computador */}
      <aside
        className={`hidden shrink-0 flex-col border-r border-borda bg-superficie transition-[width] duration-200 md:flex ${
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

      {/* Telemóvel: menu deslizante por cima do painel */}
      <div className={`fixed inset-0 z-40 md:hidden ${movelAberto ? "" : "pointer-events-none"}`} aria-hidden={!movelAberto}>
        <div
          onClick={() => setMovelAberto(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${movelAberto ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Menu do painel"
          inert={!movelAberto}
          // Escolher um link fecha o menu.
          onClick={(e) => (e.target as HTMLElement).closest("a") && setMovelAberto(false)}
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto bg-superficie p-4 shadow-xl transition-transform duration-200 ${
            movelAberto ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={() => setMovelAberto(false)}
            aria-label="Fechar menu"
            className="mb-4 flex h-10 w-10 items-center justify-center self-start rounded-lg text-suave hover:bg-fundo hover:text-texto"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </aside>
      </div>
    </>
  );
}
