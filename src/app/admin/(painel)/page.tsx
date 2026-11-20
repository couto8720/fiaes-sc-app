import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { exigirSessao } from "@/lib/sessao";
import { agora, obterConfig } from "@/lib/dados";
import { lisboaParaISO } from "@/lib/datas";
import { ROTULO_ESTADO, aoVivo, chaveDia, formatarDataHora, resumoJogo } from "@/lib/jogos";
import { Esqueleto } from "@/components/Esqueleto";

export const metadata: Metadata = { title: "Jogos" };

export default function PaginaJogosAdmin({ searchParams }: PageProps<"/admin">) {
  return (
    <Suspense fallback={<Esqueleto />}>
      <ListaJogosAdmin searchParams={searchParams} />
    </Suspense>
  );
}

async function ListaJogosAdmin({ searchParams }: Pick<PageProps<"/admin">, "searchParams">) {
  const [sessao, config, t, params] = await Promise.all([exigirSessao(), obterConfig(), agora(), searchParams]);
  const anteriores = params.ver === "anteriores";
  const filtro = typeof params.escalao === "string" ? params.escalao : "";
  const ids = sessao.escaloes.map((e) => e.id);

  if (ids.length === 0) {
    return sessao.superAdmin ? (
      <div className="rounded-xl border border-dashed border-borda p-6 text-center">
        <p className="text-suave">Ainda não há escalões. Começa por criar os escalões do clube (Sub-13, Sub-15, Seniores…).</p>
        <Link href="/admin/escaloes/novo" className="mt-4 inline-flex h-11 items-center rounded-xl bg-clube px-4 font-semibold text-clube-texto">
          + Criar o primeiro escalão
        </Link>
      </div>
    ) : (
      <p className="rounded-xl border border-dashed border-borda p-6 text-center text-suave">
        Ainda não tens escalões atribuídos. Pede ao responsável do clube para te atribuir os teus.
      </p>
    );
  }

  const hoje = chaveDia(t);
  const inicioHoje = lisboaParaISO(hoje, "00:00")!;
  const supabase = await createClient();
  let q = supabase
    .from("jogos" as any)
    .select("*, escalao:escaloes(nome, slug), local:locais(nome, maps_url)")
    .in("escalao_id", filtro && ids.includes(filtro) ? [filtro] : ids);
  q = anteriores ? q.lt("data_hora", inicioHoje) : q.gte("data_hora", inicioHoje);
  const { data: jogos, error } = await q.order("data_hora", { ascending: !anteriores }).limit(100);

  const url = (mudancas: Record<string, string>) => {
    const p = new URLSearchParams({ ...(filtro && { escalao: filtro }), ...(anteriores && { ver: "anteriores" }), ...mudancas });
    for (const [k, v] of [...p]) if (!v) p.delete(k);
    const s = p.toString();
    return s ? `/admin?${s}` : "/admin";
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black tracking-tight">Jogos</h1>
        <Link
          href={`/admin/jogos/novo${filtro ? `?escalao=${filtro}` : ""}`}
          className="flex h-11 items-center rounded-xl bg-clube px-4 font-semibold text-clube-texto"
        >
          + Novo jogo
        </Link>
      </div>

      {sessao.escaloes.length > 1 && (
        <nav aria-label="Filtrar por escalão" className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {[{ id: "", nome: "Todos" }, ...sessao.escaloes].map((e) => (
            <Link
              key={e.id || "todos"}
              href={url({ escalao: e.id })}
              aria-current={filtro === e.id ? "page" : undefined}
              className={`flex h-9 shrink-0 items-center rounded-full border px-4 text-sm font-semibold ${
                filtro === e.id ? "border-clube bg-clube text-clube-texto" : "border-borda bg-superficie"
              }`}
            >
              {e.nome}
            </Link>
          ))}
        </nav>
      )}

      <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-borda/60 p-1 text-center text-sm font-semibold">
        <Link href={url({ ver: "" })} className={`rounded-lg py-2 ${!anteriores ? "bg-superficie shadow-sm" : "text-suave"}`}>
          Hoje e próximos
        </Link>
        <Link href={url({ ver: "anteriores" })} className={`rounded-lg py-2 ${anteriores ? "bg-superficie shadow-sm" : "text-suave"}`}>
          Anteriores
        </Link>
      </div>

      {error && <p className="text-derrota">Erro ao ler jogos.</p>}
      {jogos?.length === 0 && (
        <p className="rounded-xl border border-dashed border-borda p-6 text-center text-suave">Sem jogos.</p>
      )}
      <ul className="divide-y divide-borda overflow-hidden rounded-xl border border-borda bg-superficie">
        {jogos?.map((j) => {
          const deHoje = chaveDia(j.data_hora) === hoje;
          const atrasado = j.estado === "agendado" && Date.parse(j.data_hora) + 10 * 60_000 < t;
          return (
            <li key={j.id} className={`flex items-center gap-3 p-3 ${aoVivo(j.estado) ? "bg-ao-vivo/5" : ""}`}>
              <Link href={`/admin/jogos/${j.id}`} className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase text-suave">
                  {formatarDataHora(j.data_hora)} · {j.escalao?.nome}
                  {j.jornada ? ` · J${j.jornada}` : ""}
                </p>
                <p className="truncate font-semibold">{resumoJogo(j, config.nome_curto)}</p>
                <p className={`text-xs ${aoVivo(j.estado) ? "font-bold text-ao-vivo" : "text-suave"}`}>
                  {ROTULO_ESTADO[j.estado]}
                  {j.local ? ` · ${j.local.nome}` : ""}
                </p>
                {deHoje && atrasado && (
                  <p className="mt-1 text-xs font-semibold text-empate">⚠ Já passou da hora e ainda está “Agendado”.</p>
                )}
              </Link>
              {deHoje && !anteriores ? (
                <Link
                  href={`/admin/jogos/${j.id}/marcador`}
                  className={`flex h-11 shrink-0 items-center rounded-xl px-4 text-sm font-bold ${
                    aoVivo(j.estado) || atrasado ? "bg-ao-vivo text-white" : "bg-clube text-clube-texto"
                  }`}
                >
                  Marcador
                </Link>
              ) : (
                <Link
                  href={`/admin/jogos/novo?duplicar=${j.id}`}
                  className="shrink-0 rounded-lg border border-borda px-2.5 py-1.5 text-xs font-semibold"
                  title="Criar o jogo da jornada seguinte com os mesmos dados"
                >
                  Duplicar
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
