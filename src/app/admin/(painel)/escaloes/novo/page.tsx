import type { Metadata } from "next";
import { Suspense } from "react";
import { exigirSuperAdmin } from "@/lib/sessao";
import { agora } from "@/lib/dados";
import { FormEscalao } from "@/components/admin/FormEscalao";
import { Esqueleto } from "@/components/Esqueleto";

export const metadata: Metadata = { title: "Novo escalão" };

export default function NovoEscalao() {
  return (
    <>
      <h1 className="mb-4 text-2xl font-black tracking-tight">Novo escalão</h1>
      <Suspense fallback={<Esqueleto cartoes={1} />}>
        <ConteudoNovoEscalao />
      </Suspense>
    </>
  );
}

async function ConteudoNovoEscalao() {
  const [{ escaloes }, t] = await Promise.all([exigirSuperAdmin(), agora()]);
  // A época começa em julho: em outubro de 2026 é "2026/27"; em março de 2027 também.
  const d = new Date(t);
  const ano = d.getUTCMonth() >= 6 ? d.getUTCFullYear() : d.getUTCFullYear() - 1;
  const epoca = `${ano}/${String((ano + 1) % 100).padStart(2, "0")}`;
  const ordem = String(Math.max(0, ...escaloes.map((e) => e.ordem)) + 1);
  return <FormEscalao inicial={{ epoca, ordem }} />;
}
