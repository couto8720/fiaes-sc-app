import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirSessao } from "@/lib/sessao";
import { createClient } from "@/lib/supabase/server";
import { VisualizadorEliminatoria } from "./visualizador";
import { Classificacao } from "./classificacao";

export const metadata: Metadata = { title: "Eliminatória" };
export const instant = false;

export default async function PaginaEliminatoria({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await exigirSessao();
  const supabase = await createClient();

  const { data: torneio } = await supabase
    .from("torneios")
    .select("*")
    .eq("id", id)
    .single();

  if (!torneio) {
    notFound();
  }

  // Buscar fase de eliminação
  const { data: faseEliminatoria } = await supabase
    .from("fases_torneio")
    .select("*")
    .eq("torneio_id", id)
    .eq("tipo", "eliminatoria")
    .single();

  // Buscar jogos de eliminação
  const { data: jogos } = await supabase
    .from("jogos_torneio")
    .select(`
      *,
      equipa_1:equipas_torneio!equipa_1_id(id, nome),
      equipa_2:equipas_torneio!equipa_2_id(id, nome)
    `)
    .eq("torneio_id", id)
    .eq("fase_torneio_id", faseEliminatoria?.id ?? "");

  // Buscar equipas apuradas
  const { data: apuramentos } = await supabase
    .from("apuramentos_torneio")
    .select("*, equipa:equipa_id(id, nome)")
    .eq("torneio_id", id);

  // Buscar locais
  const { data: locais } = await supabase
    .from("locais")
    .select("id, nome");

  const mapLocais = (locais || []).reduce(
    (acc, l) => ({ ...acc, [l.id]: l.nome }),
    {} as Record<string, string>
  );

  return (
    <div className="max-w-6xl">
      <Link href={`/admin/torneios/${id}`} className="mb-4 inline-flex items-center text-clube">
        ← Voltar
      </Link>

      <h1 className="mb-2 text-3xl font-black tracking-tight">🏆 Eliminatória</h1>
      <p className="mb-6 text-suave">Semi-finais, disputa de 3º lugar e final</p>

      {!faseEliminatoria ? (
        <div className="rounded-2xl border border-borda-aviso bg-aviso/10 p-6">
          <p className="font-semibold text-aviso">⚠️ Nenhuma fase de eliminação criada</p>
          <p className="mt-2 text-sm text-suave">
            Primeiro, configure as regras de qualificação e aplique-as para criar a fase de eliminação.
          </p>
          <Link
            href={`/admin/torneios/${id}/qualificacao`}
            className="mt-4 inline-flex rounded-lg bg-clube px-4 py-2 text-sm font-semibold text-clube-texto transition-opacity hover:opacity-80"
          >
            Ir para Qualificação
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <VisualizadorEliminatoria
            torneioId={id}
            jogos={jogos || []}
            apuramentos={apuramentos || []}
            temTerceiroLugar={torneio.tem_terceiro_lugar || false}
            mapLocais={mapLocais}
          />
          <Classificacao jogos={jogos || []} />
        </div>
      )}
    </div>
  );
}
