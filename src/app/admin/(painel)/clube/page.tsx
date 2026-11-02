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
    <>
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
    <CopiaSeguranca />
    </>
  );
}

function CopiaSeguranca() {
  return (
    <section className="mt-10 rounded-2xl border border-borda bg-superficie p-4">
      <h2 className="font-semibold">💾 Cópia de segurança</h2>
      <p className="mt-1 text-sm text-suave">
        Descarrega um ficheiro com todos os dados da app: escalões, jogos, marcadores, expulsões, classificações,
        locais e utilizadores. Faz uma cópia uma vez por mês e antes de mudanças grandes, e guarda-a num sítio seguro
        (contém os emails do staff).
      </p>
      {/* Link normal (não Link do Next): o ficheiro é descarregado, não é uma página. */}
      <a
        href="/admin/copia"
        download
        className="mt-3 inline-flex h-11 items-center rounded-xl bg-clube px-4 font-semibold text-clube-texto"
      >
        Descarregar cópia de segurança
      </a>
    </section>
  );
}
