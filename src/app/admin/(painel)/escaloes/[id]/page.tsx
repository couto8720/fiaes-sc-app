import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { exigirSuperAdmin } from "@/lib/sessao";
import { FormEscalao } from "@/components/admin/FormEscalao";
import { Esqueleto } from "@/components/Esqueleto";

export const metadata: Metadata = { title: "Editar escalão" };

export default function EditarEscalao({ params }: PageProps<"/admin/escaloes/[id]">) {
  return (
    <>
      <h1 className="mb-4 text-2xl font-black tracking-tight">Editar escalão</h1>
      <Suspense fallback={<Esqueleto cartoes={1} />}>
        <ConteudoEditarEscalao params={params} />
      </Suspense>
    </>
  );
}

async function ConteudoEditarEscalao({ params }: Pick<PageProps<"/admin/escaloes/[id]">, "params">) {
  const [{ escaloes }, { id }] = await Promise.all([exigirSuperAdmin(), params]);
  const e = escaloes.find((x) => x.id === id);
  if (!e) notFound();

  return (
    <>
      <FormEscalao
        id={e.id}
        inicial={{
          nome: e.nome,
          slug: e.slug,
          epoca: e.epoca,
          ordem: String(e.ordem),
          competicao: e.competicao ?? "",
          ativo: e.ativo ? "1" : "0",
        }}
      />
      <p className="mt-8 text-sm text-suave">
        Para esconder um escalão do site (ex.: no fim da época), desmarca “Ativo”. Os escalões não se apagam,
        para não perder o histórico de jogos.
      </p>
    </>
  );
}
