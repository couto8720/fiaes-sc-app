"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { guardarJogo } from "@/app/admin/acoes/jogos";
import { ESTADO_INICIAL } from "@/app/admin/acoes/tipos";
import { ROTULO_ESTADO } from "@/lib/jogos";
import { ESTADOS } from "@/lib/validacao";
import type { Escalao, Local } from "@/lib/supabase/database.types";
import { BotaoSubmeter, Campo, Mensagem, classeInput } from "./ui";

type Props = {
  id?: string;
  escaloes: Pick<Escalao, "id" | "nome">[];
  locais: Pick<Local, "id" | "nome">[];
  inicial: Record<string, string>;
};

export function FormJogo({ id, escaloes, locais, inicial }: Props) {
  const [estado, acao] = useActionState(guardarJogo, ESTADO_INICIAL);
  const v = (k: string) => estado.valores?.[k] ?? inicial[k] ?? "";
  const e = estado.erros ?? {};
  const [localNovo, setLocalNovo] = useState(Boolean(v("novo_local")));

  return (
    <form action={acao} className="space-y-5" noValidate>
      {id && <input type="hidden" name="id" value={id} />}
      {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}

      <Campo rotulo="Escalão" nome="escalao_id" erro={e.escalao_id}>
        <select id="escalao_id" name="escalao_id" defaultValue={v("escalao_id")} aria-invalid={Boolean(e.escalao_id)} className={classeInput}>
          <option value="">Escolhe…</option>
          {escaloes.map((x) => (
            <option key={x.id} value={x.id}>{x.nome}</option>
          ))}
        </select>
      </Campo>

      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Data" nome="data" erro={e.data}>
          <input id="data" name="data" type="date" defaultValue={v("data")} aria-invalid={Boolean(e.data)} className={classeInput} />
        </Campo>
        <Campo rotulo="Hora" nome="hora">
          <input id="hora" name="hora" type="time" step={300} defaultValue={v("hora")} aria-invalid={Boolean(e.data)} className={classeInput} />
        </Campo>
      </div>

      <Campo rotulo="Adversário" nome="adversario" erro={e.adversario}>
        <input id="adversario" name="adversario" defaultValue={v("adversario")} maxLength={80} autoComplete="off" aria-invalid={Boolean(e.adversario)} className={classeInput} />
      </Campo>

      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold">O clube joga</legend>
        <div className="grid grid-cols-2 gap-2">
          {[["1", "Em casa"], ["0", "Fora"]].map(([valor, rotulo]) => (
            <label key={valor} className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-borda bg-superficie font-semibold has-[:checked]:border-clube has-[:checked]:bg-clube has-[:checked]:text-clube-texto">
              <input type="radio" name="em_casa" value={valor} defaultChecked={v("em_casa") === valor} className="sr-only" />
              {rotulo}
            </label>
          ))}
        </div>
        {e.em_casa && <p className="mt-1 text-sm font-medium text-derrota">{e.em_casa}</p>}
      </fieldset>

      {localNovo ? (
        <Campo rotulo="Novo local" nome="novo_local" erro={e.novo_local} ajuda="Fica guardado na lista de locais para os próximos jogos.">
          <input id="novo_local" name="novo_local" defaultValue={v("novo_local")} maxLength={80} placeholder="ex.: Campo Municipal de…" className={classeInput} />
        </Campo>
      ) : (
        <Campo rotulo="Local" nome="local_id">
          <select id="local_id" name="local_id" defaultValue={v("local_id")} className={classeInput}>
            <option value="">A definir</option>
            {locais.map((l) => (
              <option key={l.id} value={l.id}>{l.nome}</option>
            ))}
          </select>
        </Campo>
      )}
      <button type="button" onClick={() => setLocalNovo((x) => !x)} className="-mt-3 text-sm font-semibold text-clube underline underline-offset-2 dark:text-destaque">
        {localNovo ? "Escolher da lista" : "+ O local não está na lista"}
      </button>

      <div className="grid grid-cols-[1fr_6rem] gap-3">
        <Campo rotulo="Competição (opcional)" nome="competicao" erro={e.competicao} ajuda="Só se for diferente da do escalão (ex.: Taça).">
          <input id="competicao" name="competicao" defaultValue={v("competicao")} maxLength={80} className={classeInput} />
        </Campo>
        <Campo rotulo="Jornada" nome="jornada" erro={e.jornada}>
          <input id="jornada" name="jornada" type="number" inputMode="numeric" min={1} max={99} defaultValue={v("jornada")} className={classeInput} />
        </Campo>
      </div>

      <details className="rounded-xl border border-borda bg-superficie p-4" open={Boolean(id) || Boolean(e.golos || e.estado)}>
        <summary className="cursor-pointer font-semibold">Estado e resultado</summary>
        <div className="mt-4 space-y-4">
          <Campo rotulo="Estado" nome="estado" erro={e.estado} ajuda="Durante o jogo, usa o marcador ao vivo (fase seguinte).">
            <select id="estado" name="estado" defaultValue={v("estado") || "agendado"} className={classeInput}>
              {ESTADOS.map((s) => (
                <option key={s} value={s}>{ROTULO_ESTADO[s]}</option>
              ))}
            </select>
          </Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo rotulo="Golos do clube" nome="golos_clube" erro={e.golos}>
              <input id="golos_clube" name="golos_clube" type="number" inputMode="numeric" min={0} max={99} defaultValue={v("golos_clube")} className={classeInput} />
            </Campo>
            <Campo rotulo="Golos do adversário" nome="golos_adversario">
              <input id="golos_adversario" name="golos_adversario" type="number" inputMode="numeric" min={0} max={99} defaultValue={v("golos_adversario")} className={classeInput} />
            </Campo>
          </div>
        </div>
      </details>

      <Campo rotulo="Notas (opcional)" nome="notas" erro={e.notas} ajuda="Aparece no site. Ex.: jogo antecipado, à porta fechada.">
        <textarea id="notas" name="notas" defaultValue={v("notas")} maxLength={300} rows={2} className={`${classeInput} h-auto py-2`} />
      </Campo>

      <div className="flex gap-3">
        <BotaoSubmeter>{id ? "Guardar alterações" : "Criar jogo"}</BotaoSubmeter>
        <Link href="/admin" className="flex h-12 items-center rounded-xl px-4 font-semibold text-suave">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
