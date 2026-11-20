import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirSessao } from "@/lib/sessao";
import { createClient } from "@/lib/supabase/server";
import { AbasTorneio } from "./abas-torneio";
import { BotaoApagarTorneio } from "./botao-apagar";

export const metadata: Metadata = { title: "Detalhes do Torneio" };
export const instant = false;

export default async function PaginaDetalhesTorneio({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessao = await exigirSessao();
  const supabase = await createClient();

  const { data: torneio } = await supabase
    .from("torneios" as any)
    .select("*")
    .eq("id", id)
    .single();

  if (!torneio) {
    notFound();
  }

  const { data: fases } = await supabase
    .from("fases_torneio" as any)
    .select("*")
    .eq("torneio_id", id);

  const { data: equipas } = await supabase
    .from("equipas_torneio" as any)
    .select("*, fase_torneio:fase_torneio_id(nome)")
    .eq("torneio_id", id)
    .order("nome");

  const { data: equipasMap } = await supabase
    .from("equipas_torneio" as any)
    .select("id, nome")
    .eq("torneio_id", id);

  const { data: jogos } = await supabase
    .from("jogos_torneio" as any)
    .select("*")
    .eq("torneio_id", id);

  const { data: locais } = await supabase
    .from("locais" as any)
    .select("id, nome");

  const mapEquipas = ((equipasMap || []) as unknown as any[]).reduce(
    (acc, e) => ({ ...acc, [e?.id || '']: e?.nome || '' }),
    {} as Record<string, string>
  );

  const mapLocais = (((locais || []) as unknown as any[]) as unknown as any[]).reduce(
    (acc, l) => ({ ...acc, [l?.id || '']: l?.nome || '' }),
    {} as Record<string, string>
  );

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
        <div className="flex gap-2">
          <Link
            href={`/admin/torneios/${torneio.id}/editar`}
            className="rounded-xl bg-clube px-5 py-3 font-semibold text-clube-texto transition-opacity hover:opacity-80"
          >
            ✏️ Editar
          </Link>
          <BotaoApagarTorneio torneioId={torneio.id} />
        </div>
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

      {/* Links para Qualificação e Eliminatória */}
      {torneio.formato === "grupos_eliminatoria" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href={`/admin/torneios/${torneio.id}/qualificacao`}
            className="rounded-xl border border-borda bg-superficie p-4 transition-colors hover:bg-fundo"
          >
            <p className="font-semibold text-clube">📊 Qualificação</p>
            <p className="text-sm text-suave">Regras e equipas apuradas</p>
          </Link>
          <Link
            href={`/admin/torneios/${torneio.id}/eliminatoria`}
            className="rounded-xl border border-borda bg-superficie p-4 transition-colors hover:bg-fundo"
          >
            <p className="font-semibold text-vitoria">🏆 Eliminatória</p>
            <p className="text-sm text-suave">Bracket e jogos</p>
          </Link>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Equipas ({equipas?.length || 0})</h2>
        <Link
          href={`/admin/torneios/${torneio.id}/equipas/nova`}
          className="rounded-lg bg-clube px-3 py-2 text-sm font-semibold text-clube-texto transition-opacity hover:opacity-80"
        >
          + Adicionar Equipa
        </Link>
      </div>

      <AbasTorneio
        torneioId={id}
        equipas={((equipas || []) as unknown as any[]) as unknown as any[]}
        jogos={((jogos || []) as unknown as any[]) as unknown as any[]}
        fases={((fases || []) as unknown as any[]) as unknown as any[]}
        mapEquipas={mapEquipas}
        locais={((locais || []) as unknown as any[]) as unknown as any[]}
        mapLocais={mapLocais}
      />
    </div>
  );
}
