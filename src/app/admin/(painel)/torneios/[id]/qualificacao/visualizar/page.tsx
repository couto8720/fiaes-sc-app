import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirSessao } from "@/lib/sessao";
import { createClient } from "@/lib/supabase/server";
import { VisualizadorQualificacao } from "./visualizador";

export const metadata: Metadata = { title: "Visualizar Qualificação" };
export const instant = false;

export default async function PaginaVisualizarQualificacao({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: fases } = await supabase
    .from("fases_torneio")
    .select("*")
    .eq("torneio_id", id)
    .order("numero_grupo");

  const { data: equipas } = await supabase
    .from("equipas_torneio")
    .select("*, fase_torneio:fase_torneio_id(id, nome)")
    .eq("torneio_id", id);

  const { data: jogos } = await supabase
    .from("jogos_torneio")
    .select("*")
    .eq("torneio_id", id);

  const { data: regras } = await supabase
    .from("regras_qualificacao_torneio")
    .select("*")
    .eq("torneio_id", id)
    .order("ordem");

  const { data: apuramentos } = await supabase
    .from("apuramentos_torneio")
    .select("*, regra:regra_id(nome), equipa:equipa_id(nome)")
    .eq("torneio_id", id);

  return (
    <div className="max-w-6xl">
      <Link href={`/admin/torneios/${id}`} className="mb-4 inline-flex items-center text-clube">
        ← Voltar
      </Link>

      <h1 className="mb-2 text-3xl font-black tracking-tight">Qualificação do Torneio</h1>
      <p className="mb-6 text-suave">Veja a classificação dos grupos e quais equipas avançaram</p>

      <VisualizadorQualificacao
        torneioId={id}
        torneio={torneio}
        fases={fases || []}
        equipas={equipas || []}
        jogos={jogos || []}
        regras={regras || []}
        apuramentos={apuramentos || []}
      />
    </div>
  );
}
