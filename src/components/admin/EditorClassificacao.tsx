"use client";

import { useActionState, useState } from "react";
import { guardarClassificacao } from "@/app/admin/acoes/classificacao";
import { ESTADO_INICIAL } from "@/app/admin/acoes/tipos";
import { lerTabelaColada, problemasLinha, type LinhaClassificacao } from "@/lib/colarTabela";
import { BotaoSubmeter, Mensagem } from "./ui";

const NUMEROS = [
  ["jogos", "J"],
  ["vitorias", "V"],
  ["empates", "E"],
  ["derrotas", "D"],
  ["golos_marcados", "GM"],
  ["golos_sofridos", "GS"],
  ["pontos", "Pts"],
] as const;

type Numerico = "posicao" | (typeof NUMEROS)[number][0];
/** No editor os números são texto, para se poder apagar e escrever à vontade. */
type LinhaEditor = { chave: number } & { equipa: string; e_o_clube: boolean } & Record<Numerico, string>;

let proximaChave = 1;
const paraEditor = (l: LinhaClassificacao): LinhaEditor => ({
  chave: proximaChave++,
  equipa: l.equipa,
  e_o_clube: l.e_o_clube,
  posicao: String(l.posicao),
  ...(Object.fromEntries(NUMEROS.map(([c]) => [c, String(l[c])])) as Record<(typeof NUMEROS)[number][0], string>),
});
const paraDados = (l: LinhaEditor): LinhaClassificacao => ({
  posicao: Number(l.posicao),
  equipa: l.equipa,
  e_o_clube: l.e_o_clube,
  ...(Object.fromEntries(NUMEROS.map(([c]) => [c, l[c] === "" ? NaN : Number(l[c])])) as Record<(typeof NUMEROS)[number][0], number>),
});

export function EditorClassificacao({
  escalaoId,
  iniciais,
  nomesClube,
}: {
  escalaoId: string;
  iniciais: LinhaClassificacao[];
  nomesClube: string[];
}) {
  const [linhas, setLinhas] = useState<LinhaEditor[]>(() => iniciais.map(paraEditor));
  const [texto, setTexto] = useState("");
  const [avisos, setAvisos] = useState<string[]>([]);
  const [alterado, setAlterado] = useState(false);
  const [estado, acao] = useActionState(async (anterior: typeof ESTADO_INICIAL, fd: FormData) => {
    const r = await guardarClassificacao(anterior, fd);
    if (r.ok) setAlterado(false);
    return r;
  }, ESTADO_INICIAL);

  const mudar = (novas: LinhaEditor[]) => {
    setLinhas(novas);
    setAlterado(true);
  };
  const editar = (chave: number, campo: keyof LinhaEditor, valor: string | boolean) =>
    mudar(
      linhas.map((l) =>
        l.chave === chave
          ? { ...l, [campo]: valor }
          : campo === "e_o_clube" && valor === true
            ? { ...l, e_o_clube: false } // só uma equipa é o clube
            : l,
      ),
    );

  const lerColado = () => {
    const r = lerTabelaColada(texto, nomesClube);
    setAvisos(r.avisos);
    if (!r.linhas.length) return;
    if (linhas.length && !window.confirm(`Substituir a tabela atual pelas ${r.linhas.length} equipas coladas?`)) return;
    mudar(r.linhas.map(paraEditor));
    setTexto("");
  };

  const ordenarPorPontos = () => {
    const ordenadas = [...linhas].sort((a, b) => {
      const [x, y] = [paraDados(a), paraDados(b)];
      return (
        (y.pontos || 0) - (x.pontos || 0) ||
        (y.golos_marcados - y.golos_sofridos || 0) - (x.golos_marcados - x.golos_sofridos || 0) ||
        (y.golos_marcados || 0) - (x.golos_marcados || 0)
      );
    });
    mudar(ordenadas.map((l, k) => ({ ...l, posicao: String(k + 1) })));
  };

  const adicionar = () =>
    mudar([
      ...linhas,
      paraEditor({
        posicao: linhas.length + 1, equipa: "", e_o_clube: false, jogos: 0, vitorias: 0, empates: 0,
        derrotas: 0, golos_marcados: 0, golos_sofridos: 0, pontos: 0,
      }),
    ]);

  const celula = "h-10 w-11 rounded-lg border border-borda bg-superficie text-center tabular outline-none focus:border-clube dark:focus:border-destaque";

  return (
    <div className="space-y-5">
      {/* 1. Colar do site */}
      <details className="rounded-2xl border border-borda bg-superficie" open={linhas.length === 0}>
        <summary className="cursor-pointer p-4 font-semibold">📋 Colar tabela do site da associação</summary>
        <div className="space-y-3 px-4 pb-4">
          <p className="text-sm text-suave">
            No site, seleciona a tabela inteira (do 1.º ao último lugar), copia e cola aqui. A app descobre sozinha que
            coluna é qual; confirma o resultado na tabela antes de gravar.
          </p>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={6}
            placeholder={"1  CD Exemplo  5  4  1  0  14  4  13\n2  Académico Norte  5  4  0  1  11  5  12"}
            className="w-full rounded-xl border border-borda bg-fundo p-3 font-mono text-sm outline-none focus:border-clube"
          />
          <button type="button" onClick={lerColado} disabled={!texto.trim()} className="h-11 rounded-xl bg-clube px-4 font-semibold text-clube-texto disabled:opacity-40">
            Ler tabela
          </button>
        </div>
      </details>
      {avisos.map((a) => (
        <p key={a} className="rounded-xl bg-empate/10 px-4 py-3 text-sm font-medium text-empate">⚠ {a}</p>
      ))}

      {/* 2. Tabela editável (é também a pré-visualização) */}
      <div className="-mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[640px] border-separate border-spacing-y-1 text-sm">
          <thead className="text-xs uppercase text-suave">
            <tr>
              <th title="Equipa do clube">★</th>
              <th>Pos</th>
              <th className="text-left">Equipa</th>
              {NUMEROS.map(([c, r]) => <th key={c}>{r}</th>)}
              <th />
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => {
              const problemas = problemasLinha(paraDados(l));
              return (
                <tr key={l.chave} className={l.e_o_clube ? "bg-clube/10 dark:bg-destaque/10" : ""}>
                  <td className="text-center">
                    <input type="radio" name="clube" checked={l.e_o_clube} onChange={() => editar(l.chave, "e_o_clube", true)} aria-label={`${l.equipa || "Equipa"} é o clube`} className="h-4 w-4 accent-[var(--cor-primaria)]" />
                  </td>
                  <td><input inputMode="numeric" value={l.posicao} onChange={(e) => editar(l.chave, "posicao", e.target.value)} aria-label="Posição" className={celula} /></td>
                  <td className="min-w-40">
                    <input value={l.equipa} onChange={(e) => editar(l.chave, "equipa", e.target.value)} aria-label="Equipa" maxLength={80} className="h-10 w-full rounded-lg border border-borda bg-superficie px-2 outline-none focus:border-clube dark:focus:border-destaque" />
                    {problemas.length > 0 && <span className="text-xs font-semibold text-empate">⚠ {problemas.join(" · ")}</span>}
                  </td>
                  {NUMEROS.map(([c, r]) => (
                    <td key={c}>
                      <input inputMode="numeric" value={l[c]} onChange={(e) => editar(l.chave, c, e.target.value)} aria-label={`${r} de ${l.equipa}`} className={`${celula} ${c === "pontos" ? "font-bold" : ""}`} />
                    </td>
                  ))}
                  <td>
                    <button type="button" onClick={() => mudar(linhas.filter((x) => x.chave !== l.chave))} aria-label={`Remover ${l.equipa}`} className="h-10 w-10 rounded-lg text-lg text-suave hover:text-derrota">×</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={adicionar} className="h-10 rounded-xl border border-borda px-4 text-sm font-semibold">+ Equipa</button>
        <button type="button" onClick={ordenarPorPontos} disabled={linhas.length < 2} className="h-10 rounded-xl border border-borda px-4 text-sm font-semibold disabled:opacity-40">
          Ordenar por pontos
        </button>
      </div>

      {/* 3. Gravar */}
      <form action={acao} className="space-y-3 border-t border-borda pt-5">
        <input type="hidden" name="escalao_id" value={escalaoId} />
        <input type="hidden" name="linhas" value={JSON.stringify(linhas.map(paraDados), (_, v) => (Number.isNaN(v) ? "" : v))} />
        {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
        {estado.ok && !alterado && <Mensagem tipo="ok">{estado.ok}</Mensagem>}
        <div className="flex items-center gap-3">
          <BotaoSubmeter>Guardar classificação</BotaoSubmeter>
          {alterado && <span className="text-sm text-suave">Alterações por gravar</span>}
        </div>
      </form>
    </div>
  );
}
