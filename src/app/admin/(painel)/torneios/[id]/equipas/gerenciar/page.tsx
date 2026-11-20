import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirSessao } from "@/lib/sessao";
import { createClient } from "@/lib/supabase/server";
import { GerenciadorEquipas } from "./gerenciador";

export const metadata: Metadata = { title: "Gerenciar Equipas" };
export const instant = false;

export default async function PaginaGerenciarEquipas({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await exigirSessao();
  const supabase = await createClient();

  const [{ data: torneio }, { data: fases }, { data: equipas }] = await Promise.all([
    supabase.from("torneios" as any).select("*" as any).eq("id", id).single(),
    supabase.from("fases_torneio" as any).select("*" as any).eq("torneio_id", id).order("numero_grupo"),
    supabase.from("equipas_torneio" as any).select("*, fase_torneio:fase_torneio_id(id, nome)" as any).eq("torneio_id", id).order("nome"),
  ]);

  if (!torneio) {
    notFound();
  }

  return (
    <div className="max-w-6xl">
      <Link href={`/admin/torneios/${torneio.id}`} className="mb-4 inline-flex items-center text-clube">
        ← Voltar
      </Link>

      <h1 className="mb-2 text-3xl font-black tracking-tight">Gerenciar Equipas</h1>
      <p className="mb-6 text-suave">Adicione, remova e distribua equipas pelos grupos</p>

      <GerenciadorEquipas
        torneioId={id}
        torneio={torneio}
        fases={((fases || []) as unknown as any[]) as unknown as any[]}
        equipasIniciais={((equipas || []) as unknown as any[]) as unknown as any[]}
      />
    </div>
  );
}
