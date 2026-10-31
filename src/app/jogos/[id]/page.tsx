import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { agora, obterConfig, obterJogo } from "@/lib/dados";
import { formatarDataHora, resumoJogo, rotuloDia, formatarHora } from "@/lib/jogos";
import { MarcadorPublico } from "@/components/MarcadorPublico";
import { BotaoPartilhar } from "@/components/BotaoPartilhar";
import { Esqueleto } from "@/components/Esqueleto";

type Props = PageProps<"/jogos/[id]">;

// Pré-visualização do link no WhatsApp/Facebook: "CD Exemplo 2–1 Outro SC · Sub-15".
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [jogo, config] = await Promise.all([obterJogo((await params).id), obterConfig()]);
  if (!jogo) return { title: "Jogo não encontrado" };
  const titulo = `${resumoJogo(jogo, config.nome_curto)} · ${jogo.escalao?.nome ?? ""}`;
  const descricao = [formatarDataHora(jogo.data_hora), jogo.local?.nome].filter(Boolean).join(" · ");
  return { title: titulo, description: descricao, openGraph: { title: titulo, description: descricao } };
}

export default function PaginaJogo({ params }: Props) {
  return (
    <Suspense fallback={<Esqueleto cartoes={2} />}>
      <ConteudoJogo params={params} />
    </Suspense>
  );
}

async function ConteudoJogo({ params }: Pick<Props, "params">) {
  const [jogo, config, t] = await Promise.all([obterJogo((await params).id), obterConfig(), agora()]);
  if (!jogo) notFound();

  const linhas: [string, React.ReactNode][] = [
    ["Dia", rotuloDia(jogo.data_hora, t)],
    ["Hora", formatarHora(jogo.data_hora)],
    ["Competição", [jogo.competicao ?? null, jogo.jornada && `Jornada ${jogo.jornada}`].filter(Boolean).join(" · ") || "—"],
    ["Joga", jogo.em_casa ? "Em casa" : "Fora"],
    ["Local", jogo.local?.nome ?? "A definir"],
  ];

  return (
    <>
      {jogo.escalao && (
        <Link href={`/escaloes/${jogo.escalao.slug}`} className="mb-3 inline-block text-sm font-semibold text-clube dark:text-destaque">
          ← {jogo.escalao.nome}
        </Link>
      )}
      <MarcadorPublico jogo={jogo} nomeClube={config.nome_curto} />

      <dl className="mt-4 divide-y divide-borda rounded-xl border border-borda bg-superficie">
        {linhas.map(([rotulo, valor]) => (
          <div key={rotulo} className="flex justify-between gap-4 px-4 py-3 text-sm">
            <dt className="text-suave">{rotulo}</dt>
            <dd className="text-right font-medium">{valor}</dd>
          </div>
        ))}
      </dl>
      {jogo.notas && <p className="mt-3 rounded-xl bg-destaque/20 px-4 py-3 text-sm">{jogo.notas}</p>}

      <div className="mt-4 flex gap-3">
        {jogo.local?.maps_url && (
          <a
            href={jogo.local.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-clube font-semibold text-clube-texto"
          >
            Como chegar
          </a>
        )}
        <BotaoPartilhar titulo={`${resumoJogo(jogo, config.nome_curto)} (${jogo.escalao?.nome ?? ""})`} />
      </div>
    </>
  );
}
