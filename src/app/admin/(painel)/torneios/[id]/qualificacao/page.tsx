import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirSessao } from "@/lib/sessao";
import { createClient } from "@/lib/supabase/server";
import { FormularioQualificacao } from "./formulario";

export const metadata: Metadata = { title: "Configurar Qualificação" };
export const instant = false;

export default async function PaginaQualificacao({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: regras } = await supabase
    .from("regras_qualificacao_torneio" as any)
    .select("*")
    .eq("torneio_id", id)
    .order("ordem");

  const { data: fases } = await supabase
    .from("fases_torneio" as any)
    .select("*")
    .eq("torneio_id", id);

  return (
    <div className="max-w-4xl">
      <Link href={`/admin/torneios/${torneio.id}/editar`} className="mb-4 inline-flex items-center text-clube">
        ← Voltar
      </Link>

      <h1 className="mb-2 text-3xl font-black tracking-tight">Regras de Qualificação</h1>
      <p className="mb-6 text-suave">Configure como as equipas avançam dos grupos para as próximas fases</p>

      <FormularioQualificacao torneioId={id} regrasAtuais={regras || []} fases={(fases || []) as unknown as any[]} />
    </div>
  );
}
