import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirSessao } from "@/lib/sessao";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Detalhes do Torneio" };
export const instant = false;

export default async function PaginaDetalhesTorneio({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessao = await exigirSessao();
  const supabase = await createClient();

  const { data: torneio } = await supabase
    .from("torneios")
    .select("*")
    .eq("id", id)
    .single();

  if (!torneio) {
    notFound();
  }

  const { data: equipas } = await supabase
    .from("equipas_torneio")
    .select("*")
    .eq("torneio_id", id)
    .order("nome");

  const { data: jogos } = await supabase
    .from("jogos_torneio")
    .select("*")
    .eq("torneio_id", id)
    .order("criado_em", { ascending: false });

  const formatoTexto: Record<string, string> = {
    grupos: "Em grupos",
    eliminatoria: "Eliminatória",
    grupos_eliminatoria: "Grupos + Eliminatória",
    suico: "Sistema Suíço",
  };

  const estadoTexto: Record<string, string> = {
    planejamento: "Planejamento",
    em_curso: "Em curso",
    finalizado: "Finalizado",
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/torneios" className="mb-4 inline-flex items-center text-clube">
            ← Voltar
          </Link>
          <h1 className="text-3xl font-black tracking-tight">{torneio.nome}</h1>
          <p className="text-suave mt-1">{torneio.descricao || formatoTexto[torneio.formato]}</p>
        </div>
        <Link
          href={`/admin/torneios/${torneio.id}/editar`}
          className="rounded-xl bg-clube px-5 py-3 font-semibold text-clube-texto transition-opacity hover:opacity-80"
        >
          ✏️ Editar
        </Link>
      </div>

      {/* Info do Torneio */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-borda bg-superficie p-4">
          <p className="text-xs font-semibold text-suave">Status</p>
          <p className="mt-2 text-lg font-bold">{estadoTexto[torneio.estado]}</p>
        </div>
        <div className="rounded-xl border border-borda bg-superficie p-4">
          <p className="text-xs font-semibold text-suave">Formato</p>
          <p className="mt-2 text-lg font-bold">{formatoTexto[torneio.formato]}</p>
        </div>
        <div className="rounded-xl border border-borda bg-superficie p-4">
          <p className="text-xs font-semibold text-suave">Equipas</p>
          <p className="mt-2 text-lg font-bold">{equipas?.length || 0}</p>
        </div>
        <div className="rounded-xl border border-borda bg-superficie p-4">
          <p className="text-xs font-semibold text-suave">Jogos</p>
          <p className="mt-2 text-lg font-bold">{jogos?.length || 0}</p>
        </div>
      </div>

      {/* Abas */}
      <div className="border-b border-borda">
        <div className="flex gap-4">
          <button className="border-b-2 border-clube px-4 py-3 font-semibold text-clube">
            Equipas
          </button>
          <button className="px-4 py-3 font-semibold text-suave">Jogos</button>
          <button className="px-4 py-3 font-semibold text-suave">Classificação</button>
        </div>
      </div>

      {/* Equipas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Equipas ({equipas?.length || 0})</h2>
          <Link
            href={`/admin/torneios/${torneio.id}/equipas/nova`}
            className="rounded-lg bg-clube px-3 py-2 text-sm font-semibold text-clube-texto transition-opacity hover:opacity-80"
          >
            + Adicionar Equipa
          </Link>
        </div>

        {equipas && equipas.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-borda">
            <table className="w-full">
              <thead>
                <tr className="border-b border-borda bg-fundo">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Nome</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Jogos</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">V-E-D</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">GF/GC</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Pontos</th>
                </tr>
              </thead>
              <tbody>
                {equipas.map((equipa) => (
                  <tr key={equipa.id} className="border-b border-borda hover:bg-fundo/50">
                    <td className="px-4 py-3 font-semibold">{equipa.nome}</td>
                    <td className="px-4 py-3 text-center">{equipa.jogos || 0}</td>
                    <td className="px-4 py-3 text-center text-sm">
                      {equipa.vitorias || 0}-{equipa.empates || 0}-{equipa.derrotas || 0}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {equipa.golos_marcados || 0}/{equipa.golos_sofridos || 0}
                    </td>
                    <td className="px-4 py-3 text-center font-bold">{equipa.pontos || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-borda bg-superficie p-8 text-center">
            <p className="text-suave">Nenhuma equipa adicionada ainda</p>
          </div>
        )}
      </div>
    </div>
  );
}
