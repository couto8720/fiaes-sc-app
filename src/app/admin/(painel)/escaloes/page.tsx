import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { exigirSuperAdmin } from "@/lib/sessao";
import { Esqueleto } from "@/components/Esqueleto";

export const metadata: Metadata = { title: "Escalões" };

export default function PaginaEscaloes() {
  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black tracking-tight">Escalões</h1>
        <Link href="/admin/escaloes/novo" className="flex h-11 items-center rounded-xl bg-clube px-4 font-semibold text-clube-texto">
          + Novo escalão
        </Link>
      </div>
      <Suspense fallback={<Esqueleto cartoes={2} />}>
        <ListaEscaloes />
      </Suspense>
    </>
  );
}

async function ListaEscaloes() {
  // A sessão do super-admin já traz todos os escalões (incluindo inativos), por ordem.
  const { escaloes } = await exigirSuperAdmin();
  return (
    <ul className="divide-y divide-borda overflow-hidden rounded-xl border border-borda bg-superficie">
      {escaloes.length === 0 && <li className="p-4 text-suave">Ainda não há escalões.</li>}
      {escaloes.map((e) => (
        <li key={e.id}>
          <Link href={`/admin/escaloes/${e.id}`} className="flex items-center justify-between gap-3 p-3">
            <span className="min-w-0">
              <span className="block font-semibold">{e.nome}</span>
              <span className="block truncate text-sm text-suave">{[e.competicao, e.epoca].filter(Boolean).join(" · ")}</span>
            </span>
            {!e.ativo && <span className="shrink-0 rounded bg-borda px-2 py-0.5 text-xs font-semibold text-suave">Inativo</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
