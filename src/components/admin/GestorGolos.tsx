"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { GoloLinha } from "@/lib/supabase/database.types";
import { abreviarNome } from "@/lib/marcadores";

type GoloEditor = Pick<GoloLinha, "id" | "marcador" | "minuto" | "penalti">;

/**
 * Marcadores do Fiães SC num jogo: lista, acrescentar e apagar.
 * Grava diretamente na BD (o RLS confirma que o utilizador gere o escalão do jogo).
 * O nome é guardado sempre na forma curta ("João S."); aqui mostra-se como vai ficar.
 */
export function GestorGolos({
  jogoId,
  iniciais,
  sugestoes,
  golosClube,
  pedido = 0,
  nomeClube,
}: {
  jogoId: string;
  iniciais: GoloEditor[];
  /** Nomes já usados neste escalão (atalhos para não escrever outra vez). */
  sugestoes: string[];
  /** Golos do clube no marcador, para avisar se faltam marcadores. */
  golosClube: number | null;
  /** Muda a cada golo do clube no marcador ao vivo: põe o cursor no campo do nome. */
  pedido?: number;
  nomeClube: string;
}) {
  const [golos, setGolos] = useState(iniciais);
  const [nome, setNome] = useState("");
  const [minuto, setMinuto] = useState("");
  const [penalti, setPenalti] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aGravar, setAGravar] = useState(false);
  const campo = useRef<HTMLInputElement>(null);
  const supabase = useRef<ReturnType<typeof createClient> | null>(null);
  const cliente = () => (supabase.current ??= createClient());

  useEffect(() => {
    if (pedido > 0) {
      campo.current?.focus();
      campo.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [pedido]);

  // Atalhos: os deste jogo primeiro, depois os mais frequentes do escalão.
  const nomesUsados = [...new Set([...golos.map((g) => g.marcador), ...sugestoes])].filter((n) => n.toLowerCase() !== "autogolo");
  const curto = abreviarNome(nome);

  async function acrescentar(marcador: string) {
    const nomeFinal = abreviarNome(marcador);
    if (!nomeFinal) return setErro("Escreve o nome de quem marcou.");
    const m = minuto === "" ? null : Number(minuto);
    if (m !== null && (!Number.isInteger(m) || m < 1 || m > 130)) return setErro("Minuto entre 1 e 130.");
    setErro(null);
    setAGravar(true);
    const { data, error } = await cliente()
      .from("golos" as any)
      .insert({ jogo_id: jogoId, marcador: nomeFinal, minuto: m, penalti } as any)
      .select("id, marcador, minuto, penalti")
      .single();
    setAGravar(false);
    if (error || !data) return setErro("Não foi possível guardar o marcador. Verifica a rede e tenta outra vez.");
    setGolos((gs) => [...gs, data].sort((a, b) => (a.minuto ?? 999) - (b.minuto ?? 999)));
    setNome("");
    setMinuto("");
    setPenalti(false);
  }

  async function apagar(id: string) {
    const anterior = golos;
    setGolos((gs) => gs.filter((g) => g.id !== id));
    const { error } = await cliente().from("golos" as any).delete().eq("id", id);
    if (error) {
      setGolos(anterior);
      setErro("Não foi possível apagar. Tenta outra vez.");
    }
  }

  const faltam = (golosClube ?? 0) - golos.length;

  return (
    <section className="rounded-2xl border border-borda bg-superficie p-4">
      <h2 className="font-semibold">⚽ Marcadores do {nomeClube}</h2>
      {faltam > 0 && (
        <p className="mt-1 text-sm text-empate">
          {faltam === 1 ? "Falta indicar 1 marcador" : `Faltam indicar ${faltam} marcadores`} (opcional).
        </p>
      )}

      {golos.length > 0 && (
        <ul className="mt-3 divide-y divide-borda">
          {golos.map((g) => (
            <li key={g.id} className="flex items-center justify-between gap-3 py-2">
              <span>
                <span className="font-semibold">{g.marcador}</span>
                <span className="text-sm text-suave">
                  {g.minuto ? ` · ${g.minuto}'` : ""}
                  {g.penalti ? " · penálti" : ""}
                </span>
              </span>
              <button type="button" onClick={() => apagar(g.id)} aria-label={`Apagar golo de ${g.marcador}`} className="h-9 w-9 rounded-lg text-lg text-suave hover:text-derrota">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        className="mt-3 space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          void acrescentar(nome);
        }}
      >
        <label htmlFor={`marcador-${jogoId}`} className="block text-sm font-semibold">
          Quem marcou?
        </label>
        <div className="flex gap-2">
          <input
            ref={campo}
            id={`marcador-${jogoId}`}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do atleta"
            autoComplete="off"
            maxLength={60}
            className="h-12 min-w-0 flex-1 rounded-xl border border-borda bg-fundo px-3 outline-none focus:border-clube focus:ring-2 focus:ring-clube/30 dark:focus:border-destaque"
          />
          <input
            value={minuto}
            onChange={(e) => setMinuto(e.target.value)}
            inputMode="numeric"
            placeholder="Min."
            aria-label="Minuto (opcional)"
            className="h-12 w-16 rounded-xl border border-borda bg-fundo px-2 text-center outline-none focus:border-clube"
          />
        </div>
        {nome.trim() && curto !== nome.trim() && (
          <p className="text-xs text-suave">
            Aparece no site como <strong>{curto}</strong> (nome curto, para proteger os atletas).
          </p>
        )}
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={penalti} onChange={(e) => setPenalti(e.target.checked)} className="h-4 w-4" />
            De penálti
          </label>
          <button type="submit" disabled={aGravar || !nome.trim()} className="h-11 rounded-xl bg-clube px-4 font-semibold text-clube-texto disabled:opacity-40">
            {aGravar ? "A guardar…" : "Adicionar"}
          </button>
        </div>
        {nomesUsados.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {nomesUsados.slice(0, 16).map((n) => (
              <button
                key={n}
                type="button"
                disabled={aGravar}
                onClick={() => void acrescentar(n)}
                className="h-9 rounded-full border border-borda px-3 text-sm font-semibold active:scale-95"
                title={`Golo de ${n}`}
              >
                + {n}
              </button>
            ))}
            <button type="button" onClick={() => void acrescentar("Autogolo")} className="h-9 rounded-full border border-dashed border-borda px-3 text-sm text-suave">
              + Autogolo
            </button>
          </div>
        )}
        {erro && <p role="alert" className="text-sm font-medium text-derrota">{erro}</p>}
      </form>
    </section>
  );
}
