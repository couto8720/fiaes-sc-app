"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

export const classeInput =
  "h-12 w-full rounded-xl border border-borda bg-superficie px-3 text-base text-texto outline-none focus:border-clube focus:ring-2 focus:ring-clube/30 dark:focus:border-destaque dark:focus:ring-destaque/30 aria-[invalid=true]:border-derrota";

export function Campo({
  rotulo,
  nome,
  erro,
  ajuda,
  children,
}: {
  rotulo: string;
  nome: string;
  erro?: string;
  ajuda?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={nome} className="block text-sm font-semibold">
        {rotulo}
      </label>
      {children}
      {ajuda && !erro && <p className="text-xs text-suave">{ajuda}</p>}
      {erro && (
        <p id={`${nome}-erro`} className="text-sm font-medium text-derrota">
          {erro}
        </p>
      )}
    </div>
  );
}

export function BotaoSubmeter({
  children,
  variante = "principal",
  confirmar,
  ...resto
}: {
  children: ReactNode;
  variante?: "principal" | "perigo" | "secundario";
  /** Aviso antes de submeter (ex.: apagar). */
  confirmar?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  const estilos = {
    principal: "bg-clube text-clube-texto",
    perigo: "bg-derrota text-white",
    secundario: "border border-borda bg-superficie text-texto",
  }[variante];

  return (
    <>
      {confirmar && (
        <p className="mb-3 rounded-lg bg-aviso/15 p-3 text-center text-sm text-aviso">
          ⚠️ {confirmar}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={`h-12 shrink-0 whitespace-nowrap rounded-xl px-5 font-semibold transition-opacity disabled:opacity-60 ${estilos}`}
        {...resto}
      >
        {pending ? "A guardar…" : children}
      </button>
    </>
  );
}

export function Mensagem({ tipo, children }: { tipo: "erro" | "ok"; children: ReactNode }) {
  return (
    <p
      role={tipo === "erro" ? "alert" : "status"}
      className={`rounded-xl px-4 py-3 text-sm font-medium ${
        tipo === "erro" ? "bg-derrota/10 text-derrota" : "bg-vitoria/10 text-vitoria"
      }`}
    >
      {children}
    </p>
  );
}
