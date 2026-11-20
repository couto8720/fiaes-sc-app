import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { exigirSessao } from "@/lib/sessao";
import { FormLocal } from "@/components/admin/FormLocal";
import { Esqueleto } from "@/components/Esqueleto";

export const metadata: Metadata = { title: "Locais" };

export default function PaginaLocais() {
  return (
    <>
      <h1 className="mb-4 text-2xl font-black tracking-tight">Locais</h1>
      <Suspense fallback={<Esqueleto cartoes={2} />}>
        <ListaLocais />
      </Suspense>
    </>
  );
}

async function ListaLocais() {
  await exigirSessao();
  const supabase = await createClient();
  const { data: locais } = await supabase.from("locais" as any).select("*").order("nome");

  return (
    <>
      <ul className="mb-8 divide-y divide-borda overflow-hidden rounded-xl border border-borda bg-superficie">
        {locais?.length === 0 && <li className="p-4 text-suave">Ainda não há locais.</li>}
        {locais?.map((l) => (
          <li key={l.id}>
            <Link href={`/admin/locais/${l.id}`} className="flex items-center justify-between gap-3 p-3">
              <span className="min-w-0">
                <span className="block truncate font-semibold">{l.nome}</span>
                {l.morada && <span className="block truncate text-sm text-suave">{l.morada}</span>}
              </span>
              <span className={`shrink-0 text-xs ${l.maps_url ? "text-vitoria" : "text-suave"}`}>
                {l.maps_url ? "Com mapa" : "Sem mapa"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="mb-3 text-lg font-bold">Adicionar local</h2>
      <FormLocal />
    </>
  );
}
