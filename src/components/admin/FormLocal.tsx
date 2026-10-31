"use client";

import { useActionState } from "react";
import { guardarLocal } from "@/app/admin/acoes/locais";
import { ESTADO_INICIAL } from "@/app/admin/acoes/tipos";
import { BotaoSubmeter, Campo, Mensagem, classeInput } from "./ui";

export function FormLocal({ id, inicial = {} }: { id?: string; inicial?: Record<string, string> }) {
  const [estado, acao] = useActionState(guardarLocal, ESTADO_INICIAL);
  const v = (k: string) => estado.valores?.[k] ?? inicial[k] ?? "";
  const e = estado.erros ?? {};

  return (
    <form action={acao} className="space-y-4" noValidate>
      {id && <input type="hidden" name="id" value={id} />}
      {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
      <Campo rotulo="Nome" nome="nome" erro={e.nome}>
        <input id="nome" name="nome" defaultValue={v("nome")} maxLength={80} aria-invalid={Boolean(e.nome)} className={classeInput} />
      </Campo>
      <Campo rotulo="Morada (opcional)" nome="morada" erro={e.morada}>
        <input id="morada" name="morada" defaultValue={v("morada")} maxLength={150} className={classeInput} />
      </Campo>
      <Campo
        rotulo="Link do Google Maps (opcional)"
        nome="maps_url"
        erro={e.maps_url}
        ajuda="No Google Maps: Partilhar → Copiar link. Aparece como “Como chegar”."
      >
        <input id="maps_url" name="maps_url" type="url" inputMode="url" defaultValue={v("maps_url")} placeholder="https://maps.app.goo.gl/…" aria-invalid={Boolean(e.maps_url)} className={classeInput} />
      </Campo>
      <BotaoSubmeter>{id ? "Guardar alterações" : "Adicionar local"}</BotaoSubmeter>
    </form>
  );
}
