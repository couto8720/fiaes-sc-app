import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { exigirSessao } from "@/lib/sessao";
import { agora } from "@/lib/dados";
import { RecentActivity } from "./activity";

export const metadata: Metadata = { title: "Dashboard" };

export default function PaginaDashboard() {
  return (
    <Suspense fallback={<div className="animate-pulse">Carregando...</div>}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const [sessao, agora_] = await Promise.all([exigirSessao(), agora()]);
  const supabase = await createClient();

  // Buscar estatísticas
  const ids = sessao.escaloes.map((e) => e.id);

  const [
    { data: jogosProximos },
    { data: jogosResultados },
    { data: classificacoes },
  ] = await Promise.all([
    supabase
      .from("jogos" as any)
      .select("id")
      .in("escalao_id", ids)
      .gte("data_hora", new Date(agora_).toISOString())
      .limit(1),
    supabase
      .from("jogos" as any)
      .select("id")
      .in("escalao_id", ids)
      .eq("estado", "final")
      .limit(10),
    supabase
      .from("classificacoes" as any)
      .select("id")
      .in("escalao_id", ids),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-6 text-3xl font-black tracking-tight">Painel de Controlo</h1>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            {
              label: "Próximos Jogos",
              valor: jogosProximos?.length || 0,
              href: "/admin/jogos?ver=",
              cor: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
            },
            {
              label: "Resultados",
              valor: jogosResultados?.length || 0,
              href: "/admin/jogos?ver=anteriores",
              cor: "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100"
            },
            {
              label: "Classificações",
              valor: classificacoes?.length || 0,
              href: "/admin/classificacao",
              cor: "bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100"
            },
            {
              label: "Escalões",
              valor: sessao.escaloes.length,
              href: "/admin/escaloes",
              cor: "bg-orange-100 text-orange-900 dark:bg-orange-900 dark:text-orange-100"
            },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`rounded-xl p-6 font-semibold transition hover:shadow-lg ${item.cor}`}
            >
              <div className="text-sm opacity-80">{item.label}</div>
              <div className="mt-2 text-3xl font-bold">{item.valor}</div>
            </Link>
          ))}
        </div>

        {/* Ações Rápidas */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold">Ações Rápidas</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/admin/jogos/novo"
              className="rounded-xl border border-borda bg-superficie px-4 py-3 text-center font-semibold transition hover:bg-borda"
            >
              + Novo Jogo
            </Link>
            <Link
              href="/admin/classificacao"
              className="rounded-xl border border-borda bg-superficie px-4 py-3 text-center font-semibold transition hover:bg-borda"
            >
              📊 Classificação
            </Link>
            <Link
              href="/admin/locais"
              className="rounded-xl border border-borda bg-superficie px-4 py-3 text-center font-semibold transition hover:bg-borda"
            >
              📍 Locais
            </Link>
            <Link
              href="/admin/zerozero"
              className="rounded-xl border border-borda bg-superficie px-4 py-3 text-center font-semibold transition hover:bg-borda"
            >
              🔄 ZeroZero API
            </Link>
          </div>
        </div>

        {/* Seções Principais */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Próximos Jogos */}
          <div>
            <h2 className="mb-4 text-xl font-bold">Próximos Jogos</h2>
            <div className="rounded-xl border border-borda bg-superficie">
              {jogosProximos && jogosProximos.length > 0 ? (
                <ul className="divide-y divide-borda">
                  {jogosProximos.slice(0, 5).map((jogo) => (
                    <li key={jogo.id} className="p-3">
                      <Link
                        href={`/admin/jogos/${jogo.id}`}
                        className="text-clube hover:underline font-semibold"
                      >
                        Ver Jogo →
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-6 text-center text-suave">Sem jogos agendados</p>
              )}
            </div>
          </div>

          {/* Últimos Resultados */}
          <div>
            <h2 className="mb-4 text-xl font-bold">Últimos Resultados</h2>
            <div className="rounded-xl border border-borda bg-superficie">
              {jogosResultados && jogosResultados.length > 0 ? (
                <ul className="divide-y divide-borda">
                  {jogosResultados.slice(0, 5).map((jogo) => (
                    <li key={jogo.id} className="p-3">
                      <Link
                        href={`/admin/jogos/${jogo.id}`}
                        className="text-clube hover:underline font-semibold"
                      >
                        Ver Resultado →
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-6 text-center text-suave">Sem resultados ainda</p>
              )}
            </div>
          </div>
        </div>

        {/* Atividades Recentes */}
        <div>
          <Suspense fallback={<div className="animate-pulse">Carregando atividades...</div>}>
            <RecentActivity />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
