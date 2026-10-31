import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { supabaseConfigurado } from "@/lib/supabase/env";
import { exigirSessao } from "@/lib/sessao";
import { AvisoSemSupabase } from "@/components/admin/CartaoEntrada";
import { LinksAdmin } from "@/components/admin/LinksAdmin";
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
    <>
      <Suspense fallback={<div className="mb-5 h-[88px]" />}>
        <NavAdmin />
      </Suspense>
      {children}
    </>
  );
}

async function NavAdmin() {
  const s = await exigirSessao();
  return (
    <div className="mb-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-sm text-suave">
          <span className="font-semibold text-texto">{s.perfil.nome}</span>
          {s.superAdmin ? " · super-admin" : ` · ${s.escaloes.map((e) => e.nome).join(", ") || "sem escalões"}`}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/admin/definir-palavra-passe" className="text-sm font-semibold text-suave underline-offset-2 hover:underline">
            Palavra-passe
          </Link>
          <form action={sair}>
            <button className="h-9 rounded-lg border border-borda px-3 text-sm font-semibold">Sair</button>
          </form>
        </div>
      </div>
      <LinksAdmin superAdmin={s.superAdmin} />
    </div>
  );
}
