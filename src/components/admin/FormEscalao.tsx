"use client";

import { useActionState } from "react";
import Link from "next/link";
import { guardarEscalao } from "@/app/admin/acoes/escaloes";
import { ESTADO_INICIAL } from "@/app/admin/acoes/tipos";
import { BotaoSubmeter, Campo, Mensagem, classeInput } from "./ui";

export function FormEscalao({ id, inicial }: { id?: string; inicial: Record<string, string> }) {
  const [estado, acao] = useActionState(guardarEscalao, ESTADO_INICIAL);
  const v = (k: string) => estado.valores?.[k] ?? inicial[k] ?? "";
  const e = estado.erros ?? {};
  const ativo = estado.valores ? estado.valores.ativo === "on" : inicial.ativo !== "0";

  return (
    <form action={acao} className="space-y-4" noValidate>
      {id && <input type="hidden" name="id" value={id} />}
      {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
      <Campo rotulo="Nome" nome="nome" erro={e.nome}>
        <input id="nome" name="nome" defaultValue={v("nome")} placeholder="Sub-13" maxLength={40} aria-invalid={Boolean(e.nome)} className={classeInput} />
      </Campo>
      <Campo rotulo="Endereço (opcional)" nome="slug" erro={e.slug} ajuda="Fica no link: /escaloes/sub-13. Se ficar vazio, é gerado a partir do nome.">
        <input id="slug" name="slug" defaultValue={v("slug")} placeholder="sub-13" className={classeInput} />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Época" nome="epoca" erro={e.epoca}>
          <input id="epoca" name="epoca" defaultValue={v("epoca")} placeholder="2026/27" aria-invalid={Boolean(e.epoca)} className={classeInput} />
        </Campo>
        <Campo rotulo="Ordem" nome="ordem" erro={e.ordem} ajuda="Menor aparece primeiro.">
          <input id="ordem" name="ordem" type="number" inputMode="numeric" defaultValue={v("ordem")} className={classeInput} />
        </Campo>
      </div>
      <Campo rotulo="Competição (opcional)" nome="competicao" erro={e.competicao}>
        <input id="competicao" name="competicao" defaultValue={v("competicao")} placeholder="Distrital Sub-13 — Série B" maxLength={80} className={classeInput} />
      </Campo>
      <label className="flex items-center gap-3 font-semibold">
        <input type="checkbox" name="ativo" defaultChecked={ativo} className="h-5 w-5 accent-[var(--cor-primaria)]" />
        Ativo (aparece no site)
      </label>
      <div className="flex gap-3">
        <BotaoSubmeter>{id ? "Guardar alterações" : "Criar escalão"}</BotaoSubmeter>
        <Link href="/admin/escaloes" className="flex h-12 items-center rounded-xl px-4 font-semibold text-suave">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
