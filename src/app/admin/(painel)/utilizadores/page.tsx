import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { exigirSuperAdmin } from "@/lib/sessao";
import { FormConvite } from "@/components/admin/FormUtilizador";
import { Esqueleto } from "@/components/Esqueleto";

export const metadata: Metadata = { title: "Utilizadores" };

export default function PaginaUtilizadores() {
  return (
    <>
      <h1 className="mb-4 text-2xl font-black tracking-tight">Utilizadores</h1>
      <Suspense fallback={<Esqueleto cartoes={2} />}>
        <ListaUtilizadores />
      </Suspense>
    </>
  );
}

async function ListaUtilizadores() {
  const sessao = await exigirSuperAdmin();
  const supabase = await createClient();
  const [{ data: perfis }, { data: atribuicoes }] = await Promise.all([
    supabase.from("perfis" as any).select("*").order("nome"),
    supabase.from("perfis_escaloes" as any).select("perfil_id, escalao_id"),
  ]);
  const nomeEscalao = new Map(sessao.escaloes.map((e) => [e.id, e.nome]));

  return (
    <>
      <ul className="mb-8 divide-y divide-borda overflow-hidden rounded-xl border border-borda bg-superficie">
        {perfis?.map((p) => {
          const escaloes = (atribuicoes ?? []).filter((a) => a.perfil_id === p.id).map((a) => nomeEscalao.get(a.escalao_id));
          return (
            <li key={p.id}>
              <Link href={`/admin/utilizadores/${p.id}`} className={`flex items-center justify-between gap-3 p-3 ${p.ativo ? "" : "opacity-60"}`}>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">
                    {p.nome}
                    {p.id === sessao.userId && <span className="font-normal text-suave"> (tu)</span>}
                  </span>
                  <span className="block truncate text-sm text-suave">{p.email}</span>
                  <span className="block truncate text-xs text-suave">
                    {p.papel === "super_admin" ? "Super-admin · todos os escalões" : escaloes.join(", ") || "Sem escalões atribuídos"}
                  </span>
                </span>
                {!p.ativo && <span className="shrink-0 rounded bg-borda px-2 py-0.5 text-xs font-semibold text-suave">Desativado</span>}
              </Link>
            </li>
          );
        })}
      </ul>
      <h2 className="mb-3 text-lg font-bold">Convidar alguém</h2>
      <FormConvite escaloes={sessao.escaloes} />
    </>
  );
}
