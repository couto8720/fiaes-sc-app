import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { agora, obterConfig, obterEscaloes, obterJogos } from "@/lib/dados";
import { CartaoJogo } from "@/components/CartaoJogo";

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
        <h1 className="mb-1 font-display text-4xl leading-none font-semibold uppercase tracking-wide">Resultados</h1>
        <p className="text-suave">Últimos jogos realizados</p>
      </div>

      {resultados.length > 0 ? (
        <div className="space-y-3">
          {resultados.map((jogo) => (
            <CartaoJogo key={jogo.id} jogo={jogo} nomeClube={config.nome_curto} mostrarDia />
          ))}
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
