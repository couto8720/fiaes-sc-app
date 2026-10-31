"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { definirPalavraPasse, entrar, pedirRecuperacao } from "@/app/admin/acoes/auth";
import { ESTADO_INICIAL } from "@/app/admin/acoes/tipos";
import { BotaoSubmeter, Campo, Mensagem, classeInput } from "./ui";

export function FormLogin() {
  const params = useSearchParams();
  const [estado, acao] = useActionState(entrar, ESTADO_INICIAL);
  const linkInvalido = params.get("erro") === "link";

  return (
    <form action={acao} className="space-y-4">
      {linkInvalido && !estado.erro && (
        <Mensagem tipo="erro">O link do email é inválido ou expirou. Pede um novo.</Mensagem>
      )}
      {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
      <input type="hidden" name="seguinte" value={params.get("seguinte") ?? ""} />
      <Campo rotulo="Email" nome="email">
        <input id="email" name="email" type="email" autoComplete="username" required defaultValue={estado.valores?.email} className={classeInput} />
      </Campo>
      <Campo rotulo="Palavra-passe" nome="password">
        <input id="password" name="password" type="password" autoComplete="current-password" required className={classeInput} />
      </Campo>
      <BotaoSubmeter>Entrar</BotaoSubmeter>
      <p className="text-sm">
        <Link href="/admin/recuperar" className="text-suave underline underline-offset-2">
          Esqueci-me da palavra-passe
        </Link>
      </p>
    </form>
  );
}

export function FormRecuperar() {
  const [estado, acao] = useActionState(pedirRecuperacao, ESTADO_INICIAL);
  return (
    <form action={acao} className="space-y-4">
      {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
      {estado.ok && <Mensagem tipo="ok">{estado.ok}</Mensagem>}
      <Campo rotulo="Email" nome="email">
        <input id="email" name="email" type="email" autoComplete="username" required className={classeInput} />
      </Campo>
      <BotaoSubmeter>Enviar link</BotaoSubmeter>
      <p className="text-sm">
        <Link href="/admin/login" className="text-suave underline underline-offset-2">
          Voltar ao login
        </Link>
      </p>
    </form>
  );
}

export function FormDefinirPalavraPasse() {
  const [estado, acao] = useActionState(definirPalavraPasse, ESTADO_INICIAL);
  return (
    <form action={acao} className="space-y-4">
      {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
      <Campo rotulo="Nova palavra-passe" nome="password" ajuda="Pelo menos 8 caracteres.">
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className={classeInput} />
      </Campo>
      <Campo rotulo="Repetir palavra-passe" nome="confirmacao">
        <input id="confirmacao" name="confirmacao" type="password" autoComplete="new-password" minLength={8} required className={classeInput} />
      </Campo>
      <BotaoSubmeter>Guardar e entrar</BotaoSubmeter>
    </form>
  );
}
