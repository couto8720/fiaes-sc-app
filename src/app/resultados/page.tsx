import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { agora, obterConfig, obterEscaloes, obterJogos } from "@/lib/dados";
import { formatarDataHora, resumoJogo } from "@/lib/jogos";

export const metadata: Metadata = {
  title: "Resultados",
  description: "Resultados dos jogos do Fiães SC",
};

export default function PaginaResultados() {
  return (
    <Suspense fallback={<div className="animate-pulse">Carregando resultados...</div>}>
      <ConteudoResultados />
    </Suspense>
  );
}

async function ConteudoResultados() {
  const t = await agora();
  const [config, escaloes, jogos] = await Promise.all([
    obterConfig(),
    obterEscaloes(),
    obterJogos({ ate: new Date(t + 7 * 86_400_000) }),
  ]);

  const resultados = jogos.filter((j) => j.estado === "final").sort((a, b) =>
    new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-black tracking-tight">Resultados</h1>
        <p className="text-suave">Últimos jogos realizados</p>
      </div>

      {resultados.length > 0 ? (
        <div className="rounded-xl border border-borda overflow-hidden">
          <ul className="divide-y divide-borda">
            {resultados.map((jogo) => (
              <li key={jogo.id} className="p-4 hover:bg-borda/30 transition">
                <Link
                  href={`/jogos/${jogo.id}`}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase text-suave">
                      {formatarDataHora(jogo.data_hora)} · {jogo.escalao?.nome}
                    </p>
                    <span className="text-xs font-bold bg-vitoria/20 text-vitoria px-2 py-1 rounded">
                      FINAL
                    </span>
                  </div>
                  <p className="font-semibold text-lg">{resumoJogo(jogo, config.nome_curto)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-borda p-6 text-center text-suave">
          <p>Nenhum resultado ainda</p>
        </div>
      )}

      <nav className="text-sm text-suave space-y-2">
        <p className="font-semibold">Ir para:</p>
        <ul className="space-y-1">
          <li><Link href="/calendario" className="hover:underline">📅 Calendário</Link></li>
          <li><Link href="/classificacao" className="hover:underline">📊 Classificação</Link></li>
        </ul>
      </nav>
    </div>
  );
}
