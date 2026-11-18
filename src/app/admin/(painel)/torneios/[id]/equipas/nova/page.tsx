import type { Metadata } from "next";
import Link from "next/link";
import { exigirSessao } from "@/lib/sessao";
import { createClient } from "@/lib/supabase/server";
import { FormularioNovaEquipa } from "./formulario";

export const metadata: Metadata = { title: "Nova Equipa" };
export const instant = false;

export default async function PaginaNovaEquipa({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessao = await exigirSessao();
  const supabase = await createClient();

  // Buscar torneio
  const { data: torneio } = await supabase
    .from("torneios")
    .select("*")
    .eq("id", id)
    .single();

  // Buscar fases do torneio
  const { data: fases } = await supabase
    .from("fases_torneio")
    .select("*")
    .eq("torneio_id", id);

  // Buscar escalões
  const { data: escaloes } = await supabase
    .from("escaloes")
    .select("*")
    .order("idade");

  return (
    <div className="max-w-2xl">
      <Link href={`/admin/torneios/${id}`} className="mb-4 inline-flex items-center text-clube">
        ← Voltar
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight">Adicionar Equipa</h1>
        <p className="mt-1 text-suave">{torneio?.nome}</p>
      </div>

      <FormularioNovaEquipa
        torneioId={id}
        fases={fases || []}
        escaloes={escaloes || []}
      />
    </div>
  );
}
