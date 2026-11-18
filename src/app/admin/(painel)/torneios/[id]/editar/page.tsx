import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirSessao } from "@/lib/sessao";
import { createClient } from "@/lib/supabase/server";
import { FormularioEditarTorneio } from "./formulario";

export const metadata: Metadata = { title: "Editar Torneio" };

export default async function PaginaEditarTorneio({ params }: { params: { id: string } }) {
  const sessao = await exigirSessao();
  const supabase = await createClient();

  const { data: torneio } = await supabase
    .from("torneios")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!torneio) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <Link href={`/admin/torneios/${torneio.id}`} className="mb-4 inline-flex items-center text-clube">
        ← Voltar
      </Link>

      <h1 className="mb-2 text-3xl font-black tracking-tight">Editar Torneio</h1>
      <p className="mb-6 text-suave">Modifique os detalhes do torneio</p>

      <FormularioEditarTorneio torneio={torneio} />
    </div>
  );
}
