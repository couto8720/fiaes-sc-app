import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { exigirSessao } from "@/lib/sessao";

export const metadata: Metadata = { title: "Torneios" };

export default function PaginaTorneios() {
  return (
    <Suspense fallback={<div className="animate-pulse">Carregando...</div>}>
      <ConteudoTorneios />
    </Suspense>
  );
}

async function ConteudoTorneios() {
  const sessao = await exigirSessao();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Torneios</h1>
          <p className="text-suave mt-1">Gerencie torneios organizados pelo clube</p>
        </div>
        <Link
          href="/admin/torneios/novo"
          className="inline-flex items-center gap-2 rounded-xl bg-clube px-5 py-3 font-semibold text-clube-texto transition-opacity hover:opacity-80"
        >
          + Novo Torneio
        </Link>
      </div>

      {/* Abas: Ativos, Passados */}
      <div className="flex gap-2 border-b border-borda">
        <button className="border-b-2 border-clube px-4 py-3 font-semibold text-clube">
          Ativos
        </button>
        <button className="px-4 py-3 font-semibold text-suave">Histórico</button>
      </div>

      {/* Grid de Torneios */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Exemplo de Card de Torneio */}
        <div className="rounded-xl border border-borda bg-superficie p-4">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="font-bold">Torneio Exemplo</h3>
              <p className="text-sm text-suave">Em grupos</p>
            </div>
            <span className="inline-flex items-center rounded-lg bg-ao-vivo/15 px-2 py-1 text-xs font-semibold text-ao-vivo">
              Em curso
            </span>
          </div>

          <div className="mb-4 space-y-1 text-sm">
            <p>📅 21 nov - 30 nov</p>
            <p>👥 12 equipas (3 grupos)</p>
            <p>🏆 Avançam 2 por grupo</p>
          </div>

          <div className="flex gap-2">
            <Link
              href="#"
              className="flex-1 rounded-lg border border-borda px-3 py-2 text-center text-sm font-semibold transition-opacity hover:opacity-80"
            >
              Ver
            </Link>
            <Link
              href="#"
              className="flex-1 rounded-lg bg-clube px-3 py-2 text-center text-sm font-semibold text-clube-texto transition-opacity hover:opacity-80"
            >
              Editar
            </Link>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-borda bg-azul/5 p-6">
        <h2 className="mb-3 font-semibold">📌 Dicas</h2>
        <ul className="space-y-2 text-sm text-suave">
          <li>✓ Escolha o formato (grupos, eliminatória, misto)</li>
          <li>✓ Customize os critérios de classificação</li>
          <li>✓ Adicione equipas (do Fiães ou externas)</li>
          <li>✓ Registre os resultados e acompanhe em tempo real</li>
        </ul>
      </div>
    </div>
  );
}
