import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { supabaseConfigurado } from "@/lib/supabase/env";
import { exigirSessao } from "@/lib/sessao";
import { AvisoSemSupabase } from "@/components/admin/CartaoEntrada";
import { LinksAdmin } from "@/components/admin/LinksAdmin";
import { BarraLateral } from "@/components/admin/BarraLateral";
import { sair } from "../acoes/auth";

export const metadata: Metadata = { title: { default: "Painel", template: "%s · Painel" }, robots: { index: false } };

export default function LayoutPainel({ children }: LayoutProps<"/admin">) {
  if (!supabaseConfigurado) {
    return (
      <div className="rounded-2xl border border-borda bg-superficie p-5">
        <AvisoSemSupabase />
      </div>
    );
  }
  return (
    // Altura = ecrã menos o cabeçalho do site (56px) e o espaço do <main> (16px): o "Sair" fica sempre visível.
    <div className="flex h-[calc(100dvh-4.5rem)] gap-0 bg-fundo">
      <Suspense fallback={<div className="w-14 shrink-0 border-r border-borda bg-superficie" />}>
        <SidebarAdmin />
      </Suspense>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

async function SidebarAdmin() {
  const s = await exigirSessao();
  return (
    <BarraLateral>
      <div className="mb-6">
        <p className="mb-2 text-sm text-suave">Utilizador</p>
        <p className="truncate text-sm font-semibold text-texto">{s.perfil.nome}</p>
        <p className="text-xs text-suave">
          {s.superAdmin ? "super-admin" : s.escaloes.map((e) => e.nome).join(", ") || "sem escalões"}
        </p>
      </div>

      <nav className="flex-1 mb-6">
        <LinksAdmin superAdmin={s.superAdmin} />
      </nav>

      <div className="border-t border-borda pt-4 flex flex-col gap-2">
        <Link href="/admin/definir-palavra-passe" className="text-sm font-semibold text-suave hover:text-texto px-3 py-2 rounded-lg hover:bg-fundo transition">
          Palavra-passe
        </Link>
        <form action={sair}>
          <button className="w-full text-left text-sm font-semibold text-suave hover:text-texto px-3 py-2 rounded-lg hover:bg-fundo transition">
            Sair
          </button>
        </form>
      </div>
    </BarraLateral>
  );
}
