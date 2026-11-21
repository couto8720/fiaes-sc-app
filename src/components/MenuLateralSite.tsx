"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Menu } from "lucide-react";
import { ITENS_NAVEGACAO } from "./NavInferior";

const CHAVE = "site-barra-aberta";
const EVENTO = "site-barra-mudou";

function subscrever(avisar: () => void) {
  window.addEventListener(EVENTO, avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener(EVENTO, avisar);
    window.removeEventListener("storage", avisar);
  };
}
const lerEscolha = () => localStorage.getItem(CHAVE);

/**
 * Menu lateral do site público em computador (≥768px), que abre e fecha com ☰.
 * Fechado fica só com os ícones. No telemóvel continua a barra de baixo (NavInferior).
 */
export function MenuLateralSite() {
  const caminho = usePathname();
  const escolha = useSyncExternalStore(subscrever, lerEscolha, () => null);
  const aberto = escolha !== "0";

  if (caminho?.startsWith("/admin")) return null;

  function alternar() {
    localStorage.setItem(CHAVE, aberto ? "0" : "1");
    window.dispatchEvent(new Event(EVENTO));
  }

  return (
    <aside
      className={`sticky top-14 hidden h-[calc(100dvh-3.5rem)] shrink-0 flex-col border-r border-borda bg-superficie py-4 transition-[width] duration-200 md:flex ${
        aberto ? "w-56 px-3" : "w-16 items-center px-2"
      }`}
    >
      <button
        type="button"
        onClick={alternar}
        aria-expanded={aberto}
        aria-label={aberto ? "Fechar menu" : "Abrir menu"}
        title={aberto ? "Fechar menu" : "Abrir menu"}
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg text-suave transition hover:bg-fundo hover:text-texto ${
          aberto ? "self-start" : ""
        }`}
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>
      <nav aria-label="Navegação principal" className="flex flex-col gap-1">
        {ITENS_NAVEGACAO.map(({ href, rotulo, Icone }) => {
          const ativo = href === "/" ? caminho === "/" : Boolean(caminho?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              aria-current={ativo ? "page" : undefined}
              title={aberto ? undefined : rotulo}
              className={`flex items-center gap-3 rounded-lg py-2.5 text-sm font-semibold transition ${
                aberto ? "px-3" : "justify-center px-0"
              } ${
                ativo
                  ? "bg-clube/10 text-clube dark:bg-destaque/10 dark:text-destaque"
                  : "text-suave hover:bg-fundo hover:text-texto"
              }`}
            >
              <Icone size={20} strokeWidth={ativo ? 2.4 : 1.8} aria-hidden />
              {aberto ? rotulo : <span className="sr-only">{rotulo}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
