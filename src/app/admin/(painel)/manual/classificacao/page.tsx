import type { Metadata } from "next";
import { Suspense } from "react";
import { exigirSessao } from "@/lib/sessao";
import { FormClassificacao } from "./form";

export const metadata: Metadata = { title: "Classificação Manual" };

export default function PaginaClassificacao() {
  return (
    <Suspense fallback={<div className="animate-pulse">Carregando...</div>}>
      <ConteudoClassificacao />
    </Suspense>
  );
}

async function ConteudoClassificacao() {
  const sessao = await exigirSessao();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-black tracking-tight">Classificação Manual</h1>
        <p className="text-suave">
          Adicione ou atualize manualmente a tabela de classificação de um escalão
        </p>
      </div>

      <FormClassificacao escaloes={sessao.escaloes} />

      {/* Info */}
      <div className="rounded-xl border border-borda bg-azul/5 p-6">
        <h3 className="font-semibold mb-3">📋 Instruções</h3>
        <ol className="text-sm text-suave space-y-2 ml-4 list-decimal">
          <li>Selecione o escalão</li>
          <li>Clique em "Nova Linha" para adicionar uma equipa</li>
          <li>Preencha os dados da equipa (posição, nome, jogos, vitórias, etc.)</li>
          <li>Clique "Salvar Classificação" para guardar tudo</li>
        </ol>
      </div>
    </div>
  );
}
