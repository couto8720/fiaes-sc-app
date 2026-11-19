"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { definirPalavraPasse, entrar, pedirRecuperacao } from "@/app/admin/acoes/auth";
import { ESTADO_INICIAL } from "@/app/admin/acoes/tipos";
import { BotaoSubmeter, Campo, Mensagem, classeInput } from "./ui";
import { REGRAS_PALAVRA_PASSE } from "@/lib/validacao";

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

export function FormRecuperar({ area = "admin" }: { area?: "admin" | "conta" }) {
  const [estado, acao] = useActionState(pedirRecuperacao, ESTADO_INICIAL);
  return (
    <form action={acao} className="space-y-4">
      {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
      {estado.ok && <Mensagem tipo="ok">{estado.ok}</Mensagem>}
      <input type="hidden" name="area" value={area} />
      <Campo rotulo="Email" nome="email">
        <input id="email" name="email" type="email" autoComplete="username" required className={classeInput} />
      </Campo>
      <BotaoSubmeter>Enviar link</BotaoSubmeter>
      <p className="text-sm">
        <Link href={area === "conta" ? "/conta" : "/admin/login"} className="text-suave underline underline-offset-2">
          Voltar ao login
        </Link>
      </p>
    </form>
  );
}

export function FormDefinirPalavraPasse() {
  const [estado, acao] = useActionState(definirPalavraPasse, ESTADO_INICIAL);
  const [nova, setNova] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  return (
    <form action={acao} className="space-y-4">
      {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
      <Campo rotulo="Nova palavra-passe" nome="password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          value={nova}
          onChange={(e) => setNova(e.target.value)}
          aria-describedby="regras-palavra-passe"
          className={classeInput}
        />
      </Campo>
      {/* As regras vão ficando a verde à medida que se escreve. */}
      <ul id="regras-palavra-passe" className="space-y-1 text-sm" aria-live="polite">
        {REGRAS_PALAVRA_PASSE.map((r) => {
          const ok = r.cumpre(nova);
          return (
            <li key={r.id} className={ok ? "font-semibold text-vitoria" : "text-suave"}>
              <span aria-hidden>{ok ? "✓" : "○"}</span> {r.texto}
              <span className="sr-only">{ok ? " (cumprido)" : " (em falta)"}</span>
            </li>
          );
        })}
      </ul>
      <Campo rotulo="Repetir palavra-passe" nome="confirmacao">
        <input
          id="confirmacao"
          name="confirmacao"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
          className={classeInput}
        />
      </Campo>
      {confirmacao && confirmacao !== nova && <p className="text-sm font-medium text-derrota">As palavras-passe não coincidem.</p>}
      <BotaoSubmeter>Guardar e entrar</BotaoSubmeter>
    </form>
  );
}
