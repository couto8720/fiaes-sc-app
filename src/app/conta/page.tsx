import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigurado } from "@/lib/supabase/env";
import { CartaoEntrada } from "@/components/admin/CartaoEntrada";
import { Esqueleto } from "@/components/Esqueleto";
import { ApagarContaAdepto, BotaoSairAdepto, FormEntrarAdepto, FormPerfilAdepto } from "@/components/conta/FormulariosConta";

export const metadata: Metadata = { title: "A minha conta", robots: { index: false } };

export default function PaginaConta() {
  return (
    <Suspense fallback={<Esqueleto cartoes={1} />}>
      <Conteudo />
    </Suspense>
  );
}

const linkStaff = (
  <p className="text-suave">
    És treinador, delegado ou da direção?{" "}
    <Link href="/admin/login" className="font-semibold text-clube underline underline-offset-2 dark:text-destaque">
      Entrar no painel
    </Link>
  </p>
);

async function Conteudo() {
  await connection();
  if (!supabaseConfigurado) {
    return (
      <CartaoEntrada area="Sócios e adeptos" titulo="Entrar">
        <p className="text-sm">A área de sócios precisa do Supabase configurado.</p>
      </CartaoEntrada>
    );
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  // Sem sessão: entrar (ou criar conta).
  if (!auth.user) {
    return (
      <CartaoEntrada
        area="Sócios e adeptos"
        titulo="Entrar"
        descricao="Segue os teus escalões em qualquer telemóvel ou computador."
        rodape={
          <>
            <p>
              Ainda não tens conta?{" "}
              <Link href="/conta/registo" className="font-semibold text-clube underline underline-offset-2 dark:text-destaque">
                Criar conta
              </Link>
            </p>
            {linkStaff}
          </>
        }
      >
        <FormEntrarAdepto />
      </CartaoEntrada>
    );
  }

  const [{ data: adepto }, { data: perfil }, { data: escaloes }] = await Promise.all([
    supabase.from("adeptos").select("*").eq("id", auth.user.id).maybeSingle(),
    supabase.from("perfis").select("id").eq("id", auth.user.id).maybeSingle(),
    supabase.from("escaloes").select("slug, nome").eq("ativo", true).order("ordem"),
  ]);

  // Conta do staff (não é conta de adepto).
  if (!adepto) {
    return (
      <CartaoEntrada area="A minha conta" titulo="Staff" descricao="Esta é uma conta do staff do clube.">
        <div className="space-y-4">
          {perfil ? (
            <Link href="/admin" className="flex h-12 items-center justify-center rounded-xl bg-clube font-semibold text-clube-texto">
              Ir para o painel
            </Link>
          ) : (
            <p className="text-sm">Esta conta ainda não tem acesso. Fala com a direção do clube.</p>
          )}
          <BotaoSairAdepto />
        </div>
      </CartaoEntrada>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <header className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-suave">Sócios e adeptos</p>
          <h1 className="truncate font-display text-4xl uppercase leading-none">Olá, {adepto.nome.split(" ")[0]}</h1>
          {adepto.numero_socio && <p className="text-sm text-suave">Sócio n.º {adepto.numero_socio}</p>}
        </div>
        <BotaoSairAdepto />
      </header>
      <section className="rounded-2xl border border-borda bg-superficie p-5">
        <FormPerfilAdepto
          inicial={{ nome: adepto.nome, numero_socio: adepto.numero_socio ?? "", escaloes: adepto.escaloes }}
          escaloes={escaloes ?? []}
        />
      </section>
      <p className="text-center text-sm">
        <Link href="/conta/palavra-passe" className="text-suave underline underline-offset-2">
          Mudar a palavra-passe
        </Link>
      </p>
      <ApagarContaAdepto />
    </div>
  );
}
