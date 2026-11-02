"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ExpulsaoLinha } from "@/lib/supabase/database.types";
import { abreviarNome } from "@/lib/marcadores";
import { CartaoVermelho } from "../CartaoVermelho";

type ExpulsaoEditor = Pick<ExpulsaoLinha, "id" | "lado" | "atleta" | "minuto">;
type Lado = ExpulsaoLinha["lado"];

/**
 * Expulsões (cartões vermelhos) de um jogo: lista, registar e apagar.
 * Grava diretamente na BD (o RLS confirma que o utilizador gere o escalão do jogo).
 * Do clube pode indicar-se o atleta (fica na forma curta, "João S."); do adversário, só o minuto.
 */
export function GestorExpulsoes({
  jogoId,
  iniciais,
  nomeClube,
  adversario,
  sugestoes = [],
}: {
  jogoId: string;
  iniciais: ExpulsaoEditor[];
  nomeClube: string;
  adversario: string;
  /** Nomes de atletas do escalão (atalhos). */
  sugestoes?: string[];
}) {
  const [expulsoes, setExpulsoes] = useState(iniciais);
  const [lado, setLado] = useState<Lado>("clube");
  const [nome, setNome] = useState("");
  const [minuto, setMinuto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aGravar, setAGravar] = useState(false);
  const supabase = useRef<ReturnType<typeof createClient> | null>(null);
  const cliente = () => (supabase.current ??= createClient());

  const nomeEquipa = (l: Lado) => (l === "clube" ? nomeClube : adversario);
  const curto = abreviarNome(nome);

  async function registar(atletaEscolhido?: string) {
    const m = minuto === "" ? null : Number(minuto);
    if (m !== null && (!Number.isInteger(m) || m < 1 || m > 130)) return setErro("Minuto entre 1 e 130.");
    const atleta = lado === "clube" ? abreviarNome(atletaEscolhido ?? nome) || null : null;
    setErro(null);
    setAGravar(true);
    const { data, error } = await cliente()
      .from("expulsoes")
      .insert({ jogo_id: jogoId, lado, atleta, minuto: m })
      .select("id, lado, atleta, minuto")
      .single();
    setAGravar(false);
    if (error || !data) return setErro("Não foi possível guardar a expulsão. Verifica a rede e tenta outra vez.");
    setExpulsoes((es) => [...es, data].sort((a, b) => (a.minuto ?? 999) - (b.minuto ?? 999)));
    setNome("");
    setMinuto("");
  }

  async function apagar(id: string) {
    const anterior = expulsoes;
    setExpulsoes((es) => es.filter((e) => e.id !== id));
    const { error } = await cliente().from("expulsoes").delete().eq("id", id);
    if (error) {
      setExpulsoes(anterior);
      setErro("Não foi possível apagar. Tenta outra vez.");
    }
  }

  return (
    <section className="rounded-2xl border border-borda bg-superficie p-4">
      <h2 className="flex items-center gap-2 font-semibold">
        <CartaoVermelho /> Expulsões
      </h2>

      {expulsoes.length > 0 && (
        <ul className="mt-3 divide-y divide-borda">
          {expulsoes.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 py-2">
              <span className="flex min-w-0 items-center gap-2">
                <CartaoVermelho />
                <span className="truncate">
                  <span className="font-semibold">{e.atleta ?? nomeEquipa(e.lado)}</span>
                  <span className="text-sm text-suave">
                    {e.atleta ? ` · ${nomeEquipa(e.lado)}` : ""}
                    {e.minuto ? ` · ${e.minuto}'` : ""}
                  </span>
                </span>
              </span>
              <button
                type="button"
                onClick={() => apagar(e.id)}
                aria-label={`Apagar expulsão${e.atleta ? ` de ${e.atleta}` : ""}`}
                className="h-9 w-9 shrink-0 rounded-lg text-lg text-suave hover:text-derrota"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        className="mt-3 space-y-2"
        onSubmit={(ev) => {
          ev.preventDefault();
          void registar();
        }}
      >
        <p className="text-sm font-semibold">Quem foi expulso?</p>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Equipa">
          {(["clube", "adversario"] as const).map((l) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={lado === l}
              onClick={() => setLado(l)}
              className={`h-11 truncate rounded-xl border px-2 text-sm font-semibold ${
                lado === l ? "border-derrota bg-derrota/10 text-derrota" : "border-borda"
              }`}
            >
              {nomeEquipa(l)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {lado === "clube" && (
            <input
              value={nome}
              onChange={(ev) => setNome(ev.target.value)}
              placeholder="Atleta (opcional)"
              aria-label="Nome do atleta (opcional)"
              autoComplete="off"
              maxLength={60}
              className="h-12 min-w-0 flex-1 rounded-xl border border-borda bg-fundo px-3 outline-none focus:border-clube focus:ring-2 focus:ring-clube/30 dark:focus:border-destaque"
            />
          )}
          <input
            value={minuto}
            onChange={(ev) => setMinuto(ev.target.value)}
            inputMode="numeric"
            placeholder="Min."
            aria-label="Minuto (opcional)"
            className={`h-12 rounded-xl border border-borda bg-fundo px-2 text-center outline-none focus:border-clube ${lado === "clube" ? "w-16" : "flex-1"}`}
          />
        </div>
        {lado === "clube" && nome.trim() && curto !== nome.trim() && (
          <p className="text-xs text-suave">
            Aparece no site como <strong>{curto}</strong> (nome curto, para proteger os atletas).
          </p>
        )}
        <button
          type="submit"
          disabled={aGravar}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-derrota font-semibold text-white disabled:opacity-40"
        >
          <CartaoVermelho claro /> {aGravar ? "A guardar…" : `Registar expulsão (${nomeEquipa(lado)})`}
        </button>
        {lado === "clube" && sugestoes.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {sugestoes.slice(0, 12).map((n) => (
              <button
                key={n}
                type="button"
                disabled={aGravar}
                onClick={() => void registar(n)}
                className="h-9 rounded-full border border-borda px-3 text-sm font-semibold active:scale-95"
                title={`Expulsão de ${n}`}
              >
                🟥 {n}
              </button>
            ))}
          </div>
        )}
        {erro && <p role="alert" className="text-sm font-medium text-derrota">{erro}</p>}
      </form>
    </section>
  );
}

