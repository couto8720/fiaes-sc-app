import type { Metadata } from "next";
import { Suspense } from "react";
import { agora, obterConfig, obterEscaloes, obterJogos } from "@/lib/dados";
import { chaveDia } from "@/lib/jogos";
import { ListaJogos } from "@/components/ListaJogos";
import { Esqueleto, Titulo } from "@/components/Esqueleto";

export const metadata: Metadata = { title: "Calendário" };

export default function Calendario() {
  return (
    <>
      <Titulo>Calendário</Titulo>
      <Suspense fallback={<Esqueleto />}>
        <ConteudoCalendario />
      </Suspense>
    </>
  );
}

async function ConteudoCalendario() {
  const t = await agora();
  const [config, escaloes, jogos] = await Promise.all([
    obterConfig(),
    obterEscaloes(),
    obterJogos({ desde: new Date(t - 86_400_000) }),
  ]);
  const hoje = chaveDia(t);

  return (
    <ListaJogos
      jogos={jogos.filter((j) => chaveDia(j.data_hora) >= hoje)}
      nomeClube={config.nome_curto}
      agora={t}
      escaloes={escaloes.map(({ slug, nome }) => ({ slug, nome }))}
      vazio="Não há jogos marcados."
    />
  );
}
