import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { exigirSessao } from "@/lib/sessao";
import { FormLocal } from "@/components/admin/FormLocal";
import { BotaoSubmeter } from "@/components/admin/ui";
import { Esqueleto } from "@/components/Esqueleto";
import { apagarLocal } from "../../../acoes/locais";

export const metadata: Metadata = { title: "Editar local" };

export default function EditarLocal({ params }: PageProps<"/admin/locais/[id]">) {
  return (
    <>
      <h1 className="mb-4 text-2xl font-black tracking-tight">Editar local</h1>
      <Suspense fallback={<Esqueleto cartoes={1} />}>
        <ConteudoEditarLocal params={params} />
      </Suspense>
    </>
  );
}

async function ConteudoEditarLocal({ params }: Pick<PageProps<"/admin/locais/[id]">, "params">) {
  const [sessao, { id }] = await Promise.all([exigirSessao(), params]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const { data: local } = await supabase.from("locais" as any).select("*").eq("id", id).maybeSingle();
  if (!local) notFound();

  return (
    <>
      <FormLocal
        id={local.id}
        inicial={{ nome: local.nome, morada: local.morada ?? "", maps_url: local.maps_url ?? "" }}
      />
      {sessao.superAdmin && (
        <form action={apagarLocal} className="mt-10 border-t border-borda pt-6">
          <input type="hidden" name="id" value={local.id} />
          <BotaoSubmeter variante="perigo" confirmar="Apagar este local? Os jogos marcados aqui ficam com o local por definir.">
            Apagar local
          </BotaoSubmeter>
        </form>
      )}
    </>
  );
}
