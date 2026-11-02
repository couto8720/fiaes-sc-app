"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { entrarAdepto, guardarPerfilAdepto, registarAdepto, sairAdepto } from "@/app/conta/acoes";
import { ESTADO_INICIAL } from "@/app/admin/acoes/tipos";
import { BotaoSubmeter, Campo, Mensagem, classeInput } from "../admin/ui";
import { REGRAS_PALAVRA_PASSE } from "@/lib/validacao";
import { definirFiltroEscalao } from "@/lib/useFiltroEscalao";

export function FormEntrarAdepto() {
  const [estado, acao] = useActionState(entrarAdepto, ESTADO_INICIAL);
  return (
    <form action={acao} className="space-y-4">
      {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
      <Campo rotulo="Email" nome="email">
        <input id="email" name="email" type="email" autoComplete="username" required defaultValue={estado.valores?.email} className={classeInput} />
      </Campo>
      <Campo rotulo="Palavra-passe" nome="password">
        <input id="password" name="password" type="password" autoComplete="current-password" required className={classeInput} />
      </Campo>
      <BotaoSubmeter>Entrar</BotaoSubmeter>
      <p className="text-sm">
        <Link href="/conta/recuperar" className="text-suave underline underline-offset-2">
          Esqueci-me da palavra-passe
        </Link>
      </p>
    </form>
  );
}

export function FormRegistoAdepto() {
  const [estado, acao] = useActionState(registarAdepto, ESTADO_INICIAL);
  const [palavra, setPalavra] = useState("");
  const [confirmacao, setConfirmacao] = useState("");

  if (estado.ok) {
    return (
      <div className="space-y-4">
        <Mensagem tipo="ok">{estado.ok}</Mensagem>
        <Link href="/conta" className="flex h-12 items-center justify-center rounded-xl bg-clube font-semibold text-clube-texto">
          Ir para entrar
        </Link>
      </div>
    );
  }

  return (
    <form action={acao} className="space-y-4">
      {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
      <Campo rotulo="Nome" nome="nome">
        <input id="nome" name="nome" autoComplete="name" maxLength={80} required defaultValue={estado.valores?.nome} className={classeInput} />
      </Campo>
      <Campo rotulo="Email" nome="email">
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={estado.valores?.email} className={classeInput} />
      </Campo>
      <Campo rotulo="Palavra-passe" nome="password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
          value={palavra}
          onChange={(e) => setPalavra(e.target.value)}
          aria-describedby="regras-palavra-passe"
          className={classeInput}
        />
      </Campo>
      <ul id="regras-palavra-passe" className="space-y-1 text-sm" aria-live="polite">
        {REGRAS_PALAVRA_PASSE.map((r) => {
          const ok = r.cumpre(palavra);
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
          minLength={10}
          required
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
          className={classeInput}
        />
      </Campo>
      {confirmacao && confirmacao !== palavra && <p className="text-sm font-medium text-derrota">As palavras-passe não coincidem.</p>}
      <p className="text-xs text-suave">
        Ao criar conta aceitas a <Link href="/privacidade" className="underline">política de privacidade</Link>. A conta serve só
        para personalizar o site; não precisas dela para ver jogos e resultados.
      </p>
      <BotaoSubmeter>Criar conta</BotaoSubmeter>
    </form>
  );
}

export function FormPerfilAdepto({
  inicial,
  escaloes,
}: {
  inicial: { nome: string; numero_socio: string; escaloes: string[] };
  escaloes: { slug: string; nome: string }[];
}) {
  const [estado, acao] = useActionState(guardarPerfilAdepto, ESTADO_INICIAL);
  const [seguidos, setSeguidos] = useState<string[]>(inicial.escaloes);

  // Depois de guardar com escalões escolhidos, a página inicial passa a mostrar "Os meus".
  useEffect(() => {
    if (estado.ok && seguidos.length > 0) definirFiltroEscalao("meus");
  }, [estado.ok, seguidos.length]);

  const alternar = (slug: string) =>
    setSeguidos((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]));

  return (
    <form action={acao} className="space-y-5">
      {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
      {estado.ok && <Mensagem tipo="ok">Guardado. Na página inicial, escolhe “⭐ Os meus” para ver só os teus escalões.</Mensagem>}
      <Campo rotulo="Nome" nome="nome" erro={estado.erros?.nome}>
        <input id="nome" name="nome" maxLength={80} required defaultValue={estado.valores?.nome ?? inicial.nome} className={classeInput} />
      </Campo>
      <Campo rotulo="Número de sócio (opcional)" nome="numero_socio" erro={estado.erros?.numero_socio} ajuda="Se fores sócio do Fiães SC.">
        <input
          id="numero_socio"
          name="numero_socio"
          inputMode="numeric"
          maxLength={20}
          defaultValue={estado.valores?.numero_socio ?? inicial.numero_socio}
          className={classeInput}
        />
      </Campo>

      <fieldset>
        <legend className="text-sm font-semibold">⭐ Os meus escalões</legend>
        <p className="mt-0.5 text-xs text-suave">Escolhe os escalões que queres seguir (por exemplo, o do teu filho).</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {escaloes.map((e) => {
            const ativo = seguidos.includes(e.slug);
            return (
              <label
                key={e.slug}
                className={`flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold ${
                  ativo ? "border-clube bg-clube text-clube-texto" : "border-borda bg-superficie"
                }`}
              >
                <input type="checkbox" name="escaloes" value={e.slug} checked={ativo} onChange={() => alternar(e.slug)} className="sr-only" />
                {ativo ? "✓ " : ""}
                {e.nome}
              </label>
            );
          })}
        </div>
      </fieldset>

      <BotaoSubmeter>Guardar</BotaoSubmeter>
    </form>
  );
}

export function BotaoSairAdepto() {
  return (
    <form action={sairAdepto}>
      <button className="h-10 rounded-xl border border-borda px-4 text-sm font-semibold">Sair</button>
    </form>
  );
}
