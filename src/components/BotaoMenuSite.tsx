"use client";

import { Menu } from "lucide-react";
import { EVENTO_ABRIR_MENU } from "./navegacao";

/**
 * Botão ☰ do cabeçalho, só no telemóvel: abre o menu deslizante.
 * No site público abre o MenuLateralSite; no painel abre a BarraLateral (cada um só existe na sua área).
 */
export function BotaoMenuSite() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(EVENTO_ABRIR_MENU))}
      aria-label="Abrir menu"
      className="-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-clube-texto/10 md:hidden"
    >
      <Menu className="h-6 w-6" aria-hidden />
    </button>
  );
}
