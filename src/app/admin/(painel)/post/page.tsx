import type { Metadata } from "next";
import { Suspense } from "react";
import { exigirSessao } from "@/lib/sessao";
import { GeradorPost } from "@/components/admin/GeradorPost";
import { Esqueleto } from "@/components/Esqueleto";

export const metadata: Metadata = { title: "Post de resultados" };

export default function PaginaPost({ searchParams }: PageProps<"/admin/post">) {
  return (
    <>
      <h1 className="mb-1 text-2xl font-black tracking-tight">Post de resultados</h1>
      <p className="mb-4 text-sm text-suave">Imagem e legenda para o Instagram e o Facebook, com todos os escalões.</p>
      <Suspense fallback={<Esqueleto cartoes={2} />}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Conteudo({ searchParams }: Pick<PageProps<"/admin/post">, "searchParams">) {
  await exigirSessao();
  return <GeradorPost searchParams={searchParams} />;
}
