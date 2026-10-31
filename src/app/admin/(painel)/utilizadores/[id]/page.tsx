import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { exigirSuperAdmin } from "@/lib/sessao";
import { FormEditarUtilizador } from "@/components/admin/FormUtilizador";
import { Esqueleto } from "@/components/Esqueleto";

export const metadata: Metadata = { title: "Editar utilizador" };

export default function EditarUtilizador({ params }: PageProps<"/admin/utilizadores/[id]">) {
  return (
    <>
      <h1 className="mb-4 text-2xl font-black tracking-tight">Editar utilizador</h1>
      <Suspense fallback={<Esqueleto cartoes={1} />}>
        <ConteudoEditarUtilizador params={params} />
      </Suspense>
    </>
  );
}

async function ConteudoEditarUtilizador({ params }: Pick<PageProps<"/admin/utilizadores/[id]">, "params">) {
  const [sessao, { id }] = await Promise.all([exigirSuperAdmin(), params]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const [{ data: perfil }, { data: atribuicoes }] = await Promise.all([
    supabase.from("perfis").select("*").eq("id", id).maybeSingle(),
    supabase.from("perfis_escaloes").select("escalao_id").eq("perfil_id", id),
  ]);
  if (!perfil) notFound();

  return (
    <>
      <p className="mb-4 text-sm text-suave">{perfil.email}</p>
      <FormEditarUtilizador
        id={perfil.id}
        inicial={{ nome: perfil.nome, papel: perfil.papel, ativo: perfil.ativo ? "1" : "0" }}
        marcados={(atribuicoes ?? []).map((a) => a.escalao_id)}
        escaloes={sessao.escaloes}
      />
    </>
  );
}
