import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Esqueleto, Titulo } from "@/components/Esqueleto";

export const metadata: Metadata = { title: "Torneios" };
export const instant = false;

export default async function PaginaTorneios() {
  await connection();
  return (
    <>
      <Titulo>Torneios</Titulo>
      <div className="mb-6 rounded-lg border border-borda/50 bg-superficie px-4 py-3 text-xs text-suave">
        <p>🏆 <strong>Torneios organizados pelo clube</strong>. Acompanhe todas as competições, fases e resultados em tempo real.</p>
      </div>
      <Suspense fallback={<Esqueleto cartoes={3} />}>
        <ConteudoTorneios />
      </Suspense>
    </>
  );
}

async function ConteudoTorneios() {
  const supabase = await createClient();
  const { data: torneios } = await supabase.from("torneios").select("*").order("criado_em", { ascending: false });

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
    <>
      {torneios && torneios.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {torneios.map((torneio) => (
            <div
              key={torneio.id}
              className="flex flex-col overflow-hidden rounded-lg border border-borda bg-superficie transition-all hover:shadow-lg"
            >
              <div className="flex-1 p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base">{torneio.nome}</h3>
                    <p className="text-xs text-suave">{formatoTexto[torneio.formato as keyof typeof formatoTexto]}</p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-lg px-2 py-1 text-xs font-semibold ${estadoCor[torneio.estado as keyof typeof estadoCor]}`}
                  >
                    {estadoTexto[torneio.estado as keyof typeof estadoTexto]}
                  </span>
                </div>

                <div className="mb-4 space-y-1 text-xs text-suave">
                  {torneio.descricao && <p>{torneio.descricao}</p>}
                  {torneio.equipas_por_grupo && (
                    <p>
                      👥 {torneio.num_grupos * torneio.equipas_por_grupo} equipas ({torneio.num_grupos} grupos)
                    </p>
                  )}
                  {torneio.avancar_por_grupo && <p>🏆 Avançam {torneio.avancar_por_grupo} por grupo</p>}
                </div>
              </div>

              <Link
                href={`/torneios/${torneio.id}`}
                className="border-t border-borda bg-corpo px-4 py-3 text-center text-sm font-semibold text-clube transition-opacity hover:opacity-80"
              >
                Ver detalhes →
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-borda bg-superficie p-8 text-center">
          <p className="text-suave">Nenhum torneio disponível no momento</p>
        </div>
      )}
    </>
  );
}
