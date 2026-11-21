"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { apagarContaAdepto, entrarAdepto, guardarPerfilAdepto, registarAdepto, sairAdepto } from "@/app/conta/acoes";
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
      {/* RGPD: aceitação explícita (caixa por marcar) e declaração de idade; a data fica registada na conta. */}
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="aceito_termos" value="sim" required className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Li e aceito a <Link href="/privacidade" className="underline">política de privacidade</Link> e os{" "}
          <Link href="/termos" className="underline">termos de utilização</Link>.
        </span>
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="idade_minima" value="sim" required className="mt-0.5 h-4 w-4 shrink-0" />
        <span>Tenho 13 anos ou mais (ou autorização dos meus pais ou tutor para criar esta conta).</span>
      </label>
      <p className="text-xs text-suave">A conta serve só para personalizar o site; não precisas dela para ver jogos e resultados.</p>
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


  const alternar = (slug: string) =>
    setSeguidos((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]));

  return (
    <form
      action={acao}
      // Ao guardar vai para a página inicial: com escalões escolhidos, já abre em "⭐ Os meus".
      onSubmit={() => definirFiltroEscalao(seguidos.length > 0 ? "meus" : "")}
      className="space-y-5"
    >
      {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
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

/** "Apagar a minha conta" (RGPD): pede confirmação explícita antes de apagar. */
export function ApagarContaAdepto() {
  const [estado, acao] = useActionState(apagarContaAdepto, ESTADO_INICIAL);
  const [confirmo, setConfirmo] = useState(false);
  return (
    <details className="rounded-2xl border border-derrota/40 bg-superficie">
      <summary className="cursor-pointer p-4 text-sm font-semibold text-derrota">Apagar a minha conta</summary>
      <form
        action={acao}
        onSubmit={(e) => {
          if (!window.confirm("Apagar a tua conta? Não dá para desfazer.")) e.preventDefault();
          else definirFiltroEscalao("");
        }}
        className="space-y-3 px-4 pb-4 text-sm"
      >
        <p>
          Apaga para sempre o teu login, nome, número de sócio e escalões seguidos. Não dá para desfazer; se quiseres
          voltar, podes criar uma conta nova.
        </p>
        {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
        <label className="flex items-start gap-2">
          <input type="checkbox" name="confirmo" value="sim" checked={confirmo} onChange={(e) => setConfirmo(e.target.checked)} className="mt-0.5 h-4 w-4" />
          Percebo que a minha conta e os meus dados vão ser apagados.
        </label>
        <button type="submit" disabled={!confirmo} className="h-11 w-full rounded-xl bg-derrota font-semibold text-white disabled:opacity-40">
          Apagar a minha conta
        </button>
      </form>
    </details>
  );
}
