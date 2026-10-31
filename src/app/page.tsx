import { Suspense } from "react";
import { agora, obterConfig, obterEscaloes, obterJogos } from "@/lib/dados";
import { PainelInicio } from "@/components/ListaJogos";
import { Esqueleto } from "@/components/Esqueleto";
import { DicaInstalar } from "@/components/DicaInstalar";

const DIA = 86_400_000;

export default function Inicio() {
  return (
    <>
      <DicaInstalar />
      <Suspense fallback={<Esqueleto />}>
        <ConteudoInicio />
      </Suspense>
    </>
  );
}

async function ConteudoInicio() {
  const t = await agora();
  const [config, escaloes, jogos] = await Promise.all([
    obterConfig(),
    obterEscaloes(),
    obterJogos({ desde: new Date(t - 7 * DIA), ate: new Date(t + 8 * DIA) }),
  ]);

  return (
    <PainelInicio
      jogos={jogos}
      nomeClube={config.nome_curto}
      agora={t}
      escaloes={escaloes.map(({ slug, nome }) => ({ slug, nome }))}
    />
  );
}
