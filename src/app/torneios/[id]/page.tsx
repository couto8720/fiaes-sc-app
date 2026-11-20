import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Titulo } from "@/components/Esqueleto";
import { TabsTorneioCliente } from "./tabs";

export const metadata: Metadata = { title: "Detalhes do Torneio" };
export const instant = false;

export default async function PaginaDetalhesTorneio({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/torneios" className="text-clube underline-offset-2 hover:underline">
          ← Torneios
        </Link>
      </div>
      <Suspense fallback={<div className="animate-pulse">Carregando...</div>}>
        <ConteudoTorneio id={id} />
      </Suspense>
    </>
  );
}

async function ConteudoTorneio({ id }: { id: string }) {
  const supabase = await createClient();

  const { data: torneio } = await supabase.from("torneios" as any).select("*").eq("id", id).single();

  if (!torneio) {
    notFound();
  }

  const { data: equipas } = await supabase
    .from("equipas_torneio" as any)
    .select("*")
    .eq("torneio_id", id)
    .order("nome");

  const { data: jogos } = await supabase
    .from("jogos_torneio" as any)
    .select("*")
    .eq("torneio_id", id)
    .order("data_hora", { ascending: true });

  const { data: standings } = await supabase
    .from("classificacao_torneio" as any)
    .select("*")
    .eq("torneio_id", id)
    .order("grupo, posicao");

  const equipasMap = new Map(((equipas || []) as unknown as any[]).map((e) => [e.id, e.nome]));

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

  const estadoCor: Record<string, string> = {
    planejamento: "bg-laranja/15 text-laranja",
    em_curso: "bg-ao-vivo/15 text-ao-vivo",
    finalizado: "bg-vitoria/15 text-vitoria",
  };

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <Titulo>{torneio.nome}</Titulo>
          <span
            className={`inline-flex items-center rounded-lg px-3 py-1 text-sm font-semibold ${estadoCor[torneio.estado as keyof typeof estadoCor]}`}
          >
            {estadoTexto[torneio.estado as keyof typeof estadoTexto]}
          </span>
        </div>

        {torneio.descricao && <p className="mb-4 text-sm text-suave">{torneio.descricao}</p>}
      </div>

      <TabsTorneioCliente
        torneio={torneio}
        equipas={(equipas || []) as unknown as any[]}
        jogos={(jogos || []) as unknown as any[]}
        standings={standings || []}
        equipasMap={equipasMap}
        formatoTexto={formatoTexto}
      />
    </div>
  );
}
