"use client";

import { useActionState } from "react";
import Link from "next/link";
import { atualizarUtilizador, convidarUtilizador } from "@/app/admin/acoes/utilizadores";
import { ESTADO_INICIAL } from "@/app/admin/acoes/tipos";
import type { Escalao } from "@/lib/supabase/database.types";
import { BotaoSubmeter, Campo, Mensagem, classeInput } from "./ui";

type EscalaoOpcao = Pick<Escalao, "id" | "nome">;

function EscolhaEscaloes({ escaloes, marcados }: { escaloes: EscalaoOpcao[]; marcados: string[] }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold">Escalões que pode gerir</legend>
      <div className="flex flex-wrap gap-2">
        {escaloes.map((e) => (
          <label key={e.id} className="flex h-10 cursor-pointer items-center gap-2 rounded-full border border-borda bg-superficie px-4 text-sm font-semibold has-[:checked]:border-clube has-[:checked]:bg-clube has-[:checked]:text-clube-texto">
            <input type="checkbox" name="escaloes" value={e.id} defaultChecked={marcados.includes(e.id)} className="sr-only" />
            {e.nome}
          </label>
        ))}
      </div>
      <p className="mt-1 text-xs text-suave">Um super-admin gere todos, independentemente desta escolha.</p>
    </fieldset>
  );
}

function SelectPapel({ valor }: { valor: string }) {
  return (
    <select id="papel" name="papel" defaultValue={valor || "treinador"} className={classeInput}>
      <option value="treinador">Treinador / delegado</option>
      <option value="super_admin">Super-admin (gere tudo)</option>
    </select>
  );
}

export function FormConvite({ escaloes }: { escaloes: EscalaoOpcao[] }) {
  const [estado, acao] = useActionState(convidarUtilizador, ESTADO_INICIAL);
  const v = (k: string) => estado.valores?.[k] ?? "";
  const e = estado.erros ?? {};

  return (
    <form action={acao} className="space-y-4" noValidate>
      {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
      {estado.ok && <Mensagem tipo="ok">{estado.ok}</Mensagem>}
      <Campo rotulo="Nome" nome="nome" erro={e.nome}>
        <input id="nome" name="nome" defaultValue={v("nome")} maxLength={60} aria-invalid={Boolean(e.nome)} className={classeInput} />
      </Campo>
      <Campo
        rotulo="Email"
        nome="email"
        erro={e.email}
        ajuda="Se ainda não tem conta, recebe um convite para escolher a palavra-passe. Se já tem conta no site, passa logo a staff e entra com a palavra-passe que já usa."
      >
        <input id="email" name="email" type="email" defaultValue={v("email")} aria-invalid={Boolean(e.email)} className={classeInput} />
      </Campo>
      <Campo rotulo="Papel" nome="papel" erro={e.papel}>
        <SelectPapel valor={v("papel")} />
      </Campo>
      <EscolhaEscaloes escaloes={escaloes} marcados={[]} />
      <BotaoSubmeter>Convidar ou dar acesso</BotaoSubmeter>
    </form>
  );
}

export function FormEditarUtilizador({
  id,
  inicial,
  marcados,
  escaloes,
}: {
  id: string;
  inicial: Record<string, string>;
  marcados: string[];
  escaloes: EscalaoOpcao[];
}) {
  const [estado, acao] = useActionState(atualizarUtilizador, ESTADO_INICIAL);
  const v = (k: string) => estado.valores?.[k] ?? inicial[k] ?? "";
  const e = estado.erros ?? {};
  const ativo = estado.valores ? estado.valores.ativo === "on" : inicial.ativo === "1";

  return (
    <form action={acao} className="space-y-4" noValidate>
      <input type="hidden" name="id" value={id} />
      {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
      <Campo rotulo="Nome" nome="nome" erro={e.nome}>
        <input id="nome" name="nome" defaultValue={v("nome")} maxLength={60} className={classeInput} />
      </Campo>
      <Campo rotulo="Papel" nome="papel" erro={e.papel}>
        <SelectPapel valor={v("papel")} />
      </Campo>
      <EscolhaEscaloes escaloes={escaloes} marcados={marcados} />
      <label className="flex items-center gap-3 font-semibold">
        <input type="checkbox" name="ativo" defaultChecked={ativo} className="h-5 w-5 accent-[var(--cor-primaria)]" />
        Acesso ativo
      </label>
      <p className="-mt-2 text-xs text-suave">Desmarca quando alguém sai do clube: perde logo o acesso.</p>
      <div className="flex gap-3">
        <BotaoSubmeter>Guardar alterações</BotaoSubmeter>
        <Link href="/admin/utilizadores" className="flex h-12 items-center rounded-xl px-4 font-semibold text-suave">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
