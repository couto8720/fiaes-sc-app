import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { exigirSessao } from "@/lib/sessao";

export const metadata: Metadata = { title: "Painel Manual" };

export default function PaginaPainelManual() {
  return (
    <Suspense fallback={<div className="animate-pulse">Carregando...</div>}>
      <ConteudoPainel />
    </Suspense>
  );
}

async function ConteudoPainel() {
  const sessao = await exigirSessao();

  const opcoes = [
    {
      titulo: "📅 Adicionar Jogo",
      descricao: "Adicione manualmente um novo jogo ao calendário",
      link: "/admin/jogos/novo",
      cor: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
      icone: "📅",
    },
    {
      titulo: "⚽ Resultado do Jogo",
      descricao: "Registre o resultado de um jogo realizado",
      link: "/admin/manual/resultados",
      cor: "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100",
      icone: "⚽",
    },
    {
      titulo: "📊 Classificação",
      descricao: "Atualize a tabela de classificação do escalão",
      link: "/admin/manual/classificacao",
      cor: "bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100",
      icone: "📊",
    },
    {
      titulo: "📍 Locais",
      descricao: "Gerencie os locais/estádios onde os jogos são realizados",
      link: "/admin/locais",
      cor: "bg-orange-100 text-orange-900 dark:bg-orange-900 dark:text-orange-100",
      icone: "📍",
    },
    {
      titulo: "🏆 Escalões",
      descricao: "Crie e gerencie os escalões do clube",
      link: "/admin/escaloes",
      cor: "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100",
      icone: "🏆",
    },
    {
      titulo: "🎯 Equipa",
      descricao: "Configure os dados da equipa/clube",
      link: "/admin/clube",
      cor: "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100",
      icone: "🎯",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-black tracking-tight">Painel Manual</h1>
        <p className="text-suave mb-8">
          Gerencie manualmente todos os dados do club: jogos, resultados, classificação e mais
        </p>

        {/* Grid de Opções */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {opcoes.map((opcao) => (
            <Link
              key={opcao.link}
              href={opcao.link}
              className={`group rounded-xl p-6 transition hover:shadow-lg ${opcao.cor}`}
            >
              <div className="mb-3 text-4xl">{opcao.icone}</div>
              <h3 className="mb-2 font-semibold">{opcao.titulo}</h3>
              <p className="text-sm opacity-80">{opcao.descricao}</p>
              <div className="mt-4 inline-flex items-center text-sm font-semibold">
                Ir → <span className="ml-1 transition group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-borda bg-azul/5 p-6">
        <h2 className="font-semibold mb-3">📌 Dicas de Uso</h2>
        <ul className="text-sm text-suave space-y-2">
          <li>✓ Use "Adicionar Jogo" para agendar novos jogos</li>
          <li>✓ Registre resultados em "Resultado do Jogo"</li>
          <li>✓ Mantenha a classificação atualizada após cada jornada</li>
          <li>✓ Adicione locais/estádios antes de agendar jogos</li>
          <li>✓ Todos os dados são salvos automaticamente no Supabase</li>
        </ul>
      </div>
    </div>
  );
}
