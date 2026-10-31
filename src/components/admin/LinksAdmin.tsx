"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LinksAdmin({ superAdmin }: { superAdmin: boolean }) {
  const caminho = usePathname();
  const links = [
    { href: "/admin", rotulo: "Jogos", ativo: caminho === "/admin" || caminho.startsWith("/admin/jogos") },
    { href: "/admin/classificacao", rotulo: "Classificação" },
    { href: "/admin/post", rotulo: "Post" },
    { href: "/admin/locais", rotulo: "Locais" },
    ...(superAdmin
      ? [
          { href: "/admin/escaloes", rotulo: "Escalões" },
          { href: "/admin/utilizadores", rotulo: "Utilizadores" },
          { href: "/admin/clube", rotulo: "Clube" },
        ]
      : []),
    { href: "/", rotulo: "Ver site ↗" },
  ];

  return (
    <nav aria-label="Painel" className="-mx-4 flex gap-1 overflow-x-auto border-b border-borda px-4 [scrollbar-width:none]">
      {links.map((l) => {
        const ativo = l.ativo ?? (l.href !== "/" && caminho.startsWith(l.href));
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={ativo ? "page" : undefined}
            className={`-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold ${
              ativo ? "border-clube text-texto dark:border-destaque" : "border-transparent text-suave"
            }`}
          >
            {l.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
