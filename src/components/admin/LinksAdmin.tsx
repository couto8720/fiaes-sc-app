"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LinksAdmin({ superAdmin }: { superAdmin: boolean }) {
  const caminho = usePathname();
  const links = [
    { href: "/admin", rotulo: "Jogos", ativo: caminho === "/admin" || caminho.startsWith("/admin/jogos") },
    { href: "/admin/classificacao", rotulo: "Classificação" },
    { href: "/admin/torneios", rotulo: "Torneios" },
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
    <nav aria-label="Painel" className="flex flex-col gap-1">
      {links.map((l) => {
        const ativo = l.ativo ?? (l.href !== "/" && caminho.startsWith(l.href));
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={ativo ? "page" : undefined}
            className={`px-3 py-2.5 text-sm font-semibold rounded-lg transition ${
              ativo
                ? "bg-clube/10 text-clube dark:bg-destaque/10 dark:text-destaque"
                : "text-suave hover:bg-fundo hover:text-texto"
            }`}
          >
            {l.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
