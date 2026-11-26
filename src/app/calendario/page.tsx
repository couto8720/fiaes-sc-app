import type { Metadata } from "next";
import { Suspense } from "react";
import { agora, obterConfig, obterEscaloes, obterJogos } from "@/lib/dados";
import { AgendaJogos } from "@/components/AgendaJogos";

export const metadata: Metadata = {
  title: "Calendário",
  description: "Calendário de jogos do Fiães SC",
};

export default function PaginaCalendario() {
  return (
    <Suspense fallback={<div className="animate-pulse">Carregando calendário...</div>}>
      <ConteudoCalendario />
    </Suspense>
  );
}

async function ConteudoCalendario() {
  const t = await agora();
  const [config, escaloes, jogos] = await Promise.all([
    obterConfig(),
    obterEscaloes(),
    obterJogos({ desde: new Date(t), ate: new Date(t + 30 * 86_400_000) }),
  ]);

  const proximos = jogos
    .filter((j) => new Date(j.data_hora).getTime() > t)
    .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-1 font-display text-4xl leading-none font-semibold uppercase tracking-wide">Calendário</h1>
        <p className="text-suave">
          {proximos.length === 1 ? "1 jogo" : `${proximos.length} jogos`} nos próximos 30 dias
        </p>
      </div>
      <AgendaJogos
        jogos={proximos}
        nomeClube={config.nome_curto}
        agora={t}
        escaloes={escaloes.map(({ slug, nome }) => ({ slug, nome }))}
      />
    </div>
  );
}
