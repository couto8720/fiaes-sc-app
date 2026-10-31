"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/", rotulo: "Início", icone: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" },
  { href: "/calendario", rotulo: "Calendário", icone: "M4 5h16v16H4zM4 9h16M8 3v4M16 3v4" },
  { href: "/resultados", rotulo: "Resultados", icone: "M5 4h14v4a7 7 0 0 1-14 0zM12 15v4M8 21h8" },
  { href: "/classificacao", rotulo: "Classificação", icone: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
];

// Lê o URL, por isso no layout fica dentro de <Suspense>, com NavInferiorVista (sem item ativo) como reserva.
export function NavInferior() {
  return <NavInferiorVista caminho={usePathname()} />;
}

export function NavInferiorVista({ caminho }: { caminho: string | null }) {
  if (caminho?.startsWith("/admin")) return null;

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-borda bg-superficie/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto grid max-w-2xl grid-cols-4">
        {ITENS.map(({ href, rotulo, icone }) => {
          const ativo = href === "/" ? caminho === "/" : Boolean(caminho?.startsWith(href));
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={ativo ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                  ativo ? "text-clube dark:text-destaque" : "text-suave"
                }`}
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={ativo ? 2.2 : 1.7} strokeLinejoin="round" strokeLinecap="round" aria-hidden>
                  <path d={icone} />
                </svg>
                {rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
