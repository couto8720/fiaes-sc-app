import type { Metadata } from "next";
import { Suspense } from "react";
import { agora, obterConfig, obterEscaloes, obterJogos } from "@/lib/dados";
import { ListaJogos } from "@/components/ListaJogos";
import { Esqueleto, Titulo } from "@/components/Esqueleto";

export const metadata: Metadata = { title: "Resultados" };

export default function Resultados() {
  return (
    <>
      <Titulo>Resultados</Titulo>
      <Suspense fallback={<Esqueleto />}>
        <ConteudoResultados />
      </Suspense>
    </>
  );
}

async function ConteudoResultados() {
  const t = await agora();
  const [config, escaloes, jogos] = await Promise.all([
    obterConfig(),
    obterEscaloes(),
    obterJogos({ ate: new Date(t), ordem: "desc" }),
  ]);

  return (
    <ListaJogos
      jogos={jogos.filter((j) => j.estado === "final")}
      nomeClube={config.nome_curto}
      agora={t}
      escaloes={escaloes.map(({ slug, nome }) => ({ slug, nome }))}
      vazio="Ainda não há resultados nesta época."
    />
  );
}
