"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Menu, X } from "lucide-react";
import { EVENTO_ABRIR_MENU, ITENS_NAVEGACAO, itemAtivo } from "./navegacao";

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
 * Menu lateral do site público.
 * - Computador (≥768px): fixo à esquerda, abre e fecha com ☰ (fechado fica só com os ícones).
 * - Telemóvel: desliza da esquerda por cima da página quando se toca no ☰ do cabeçalho.
 */
export function MenuLateralSite() {
  const caminho = usePathname();
  const escolha = useSyncExternalStore(subscrever, lerEscolha, () => null);
  const aberto = escolha !== "0";
  const [movelAberto, setMovelAberto] = useState(false);

  // O ☰ do cabeçalho (telemóvel) abre o menu deslizante.
  useEffect(() => {
    const abrir = () => setMovelAberto(true);
    window.addEventListener(EVENTO_ABRIR_MENU, abrir);
    return () => window.removeEventListener(EVENTO_ABRIR_MENU, abrir);
  }, []);

  // Com o menu deslizante aberto: Esc fecha e a página por trás não faz scroll.
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

  if (caminho?.startsWith("/admin")) return null;

  function alternar() {
    localStorage.setItem(CHAVE, aberto ? "0" : "1");
    window.dispatchEvent(new Event(EVENTO));
  }

  const links = (compacto: boolean, aoEscolher?: () => void) => (
    <nav aria-label="Navegação principal" className="flex flex-col gap-1">
      {ITENS_NAVEGACAO.map(({ href, rotulo, Icone }) => {
        const ativo = itemAtivo(href, caminho);
        return (
          <Link
            key={href}
            href={href}
            onClick={aoEscolher}
            aria-current={ativo ? "page" : undefined}
            title={compacto ? rotulo : undefined}
            className={`flex items-center gap-3 rounded-lg py-2.5 text-sm font-semibold transition ${
              compacto ? "justify-center px-0" : "px-3"
            } ${
              ativo
                ? "bg-clube/10 text-clube dark:bg-destaque/10 dark:text-destaque"
                : "text-suave hover:bg-fundo hover:text-texto"
            }`}
          >
            <Icone size={20} strokeWidth={ativo ? 2.4 : 1.8} aria-hidden />
            {compacto ? <span className="sr-only">{rotulo}</span> : rotulo}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Computador */}
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
        {links(!aberto)}
      </aside>

      {/* Telemóvel: menu deslizante por cima da página */}
      <div className={`fixed inset-0 z-40 md:hidden ${movelAberto ? "" : "pointer-events-none"}`} aria-hidden={!movelAberto}>
        <div
          onClick={() => setMovelAberto(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${movelAberto ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          inert={!movelAberto}
          className={`absolute inset-y-0 left-0 flex w-64 max-w-[80vw] flex-col bg-superficie p-4 shadow-xl transition-transform duration-200 ${
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
          {links(false, () => setMovelAberto(false))}
        </aside>
      </div>
    </>
  );
}
