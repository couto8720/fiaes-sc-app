import type { Metadata } from "next";
import { Suspense } from "react";
import { exigirSuperAdmin } from "@/lib/sessao";
import { obterConfig } from "@/lib/dados";
import { FormClube } from "@/components/admin/FormClube";
import { Esqueleto } from "@/components/Esqueleto";

export const metadata: Metadata = { title: "Clube" };

export default function PaginaClube() {
  return (
    <>
      <h1 className="mb-1 text-2xl font-black tracking-tight">Clube</h1>
      <p className="mb-4 text-sm text-suave">Nome, cores e símbolo usados em todo o site, nos ícones da app e no post.</p>
      <Suspense fallback={<Esqueleto cartoes={2} />}>
        <Conteudo />
      </Suspense>
    </>
  );
}

async function Conteudo() {
  await exigirSuperAdmin();
  const c = await obterConfig();
  return (
    <FormClube
      inicial={{
        nome: c.nome,
        nome_curto: c.nome_curto,
        cor_primaria: c.cor_primaria,
        cor_secundaria: c.cor_secundaria,
        cor_destaque: c.cor_destaque,
        hashtag: c.hashtag ?? "",
        logo_url: c.logo_url ?? "",
      }}
    />
  );
}
