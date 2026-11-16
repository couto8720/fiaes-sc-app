import type { Metadata } from "next";
import { Suspense } from "react";
import { exigirSessao } from "@/lib/sessao";
import { ZeroZeroImporter } from "./importer";

export const metadata: Metadata = { title: "Integração ZeroZero" };

export default function PaginaZeroZero() {
  return (
    <Suspense fallback={<div className="animate-pulse">Carregando...</div>}>
      <ConteudoZeroZero />
    </Suspense>
  );
}

async function ConteudoZeroZero() {
  const sessao = await exigirSessao();

  if (!sessao.superAdmin) {
    return (
      <div className="rounded-xl border border-dashed border-borda p-6 text-center text-suave">
        <p>Apenas Super Admin pode usar ZeroZero API</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-black tracking-tight">Integração ZeroZero API</h1>
        <p className="text-suave mb-6">
          Importe dados de jogos, classificação e resultados diretamente do ZeroZero
        </p>
      </div>

      {/* Info Tabs */}
      <div className="rounded-xl border border-borda bg-superficie p-6">
        <div className="mb-4 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">🔍 O que é ZeroZero?</h3>
            <p className="text-sm text-suave">
              ZeroZero é uma plataforma de dados de futebol português. Permite buscar dados sobre equipas, jogos e classificações.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">📊 Funcionalidades</h3>
            <ul className="text-sm text-suave space-y-1 ml-4">
              <li>✓ Importar próximos jogos de um escalão</li>
              <li>✓ Atualizar resultados de jogos</li>
              <li>✓ Sincronizar classificação</li>
              <li>✓ Buscar dados de adversários</li>
            </ul>
          </div>
        </div>
      </div>

      <ZeroZeroImporter escaloes={sessao.escaloes} />

      {/* Instruções */}
      <div className="rounded-xl border border-borda bg-azul/5 p-6">
        <h3 className="font-semibold mb-3">📝 Instruções de Uso</h3>
        <ol className="text-sm text-suave space-y-2 ml-4 list-decimal">
          <li>Selecione o escalão do clube que deseja importar dados</li>
          <li>Escolha o tipo de importação (Próximos Jogos, Classificação, Resultados)</li>
          <li>Clique em "Importar" para buscar os dados do ZeroZero</li>
          <li>Revise e confirme os dados antes de salvar</li>
          <li>Os dados serão sincronizados com a base de dados local</li>
        </ol>
      </div>
    </div>
  );
}
