"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, House, ListOrdered, Trophy, type LucideIcon } from "lucide-react";

const ITENS: { href: string; rotulo: string; Icone: LucideIcon }[] = [
  { href: "/", rotulo: "Início", Icone: House },
  { href: "/calendario", rotulo: "Calendário", Icone: CalendarDays },
  { href: "/resultados", rotulo: "Resultados", Icone: Trophy },
  { href: "/classificacao", rotulo: "Classificação", Icone: ListOrdered },
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
        {ITENS.map(({ href, rotulo, Icone }) => {
          const ativo = href === "/" ? caminho === "/" : Boolean(caminho?.startsWith(href));
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={ativo ? "page" : undefined}
                className={`relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                  ativo ? "text-clube dark:text-destaque" : "text-suave"
                }`}
              >
                {ativo && <span aria-hidden className="absolute top-0 h-1 w-10 rounded-b bg-destaque" />}
                <Icone size={24} strokeWidth={ativo ? 2.4 : 1.8} aria-hidden />
                {rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
