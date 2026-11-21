"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { origemDoSite } from "@/lib/sessao";
import { VERSAO_POLITICA } from "@/lib/politica";
import { validarPalavraPasse, validarPerfilAdepto } from "@/lib/validacao";
import { valoresDe, type EstadoFormulario } from "@/app/admin/acoes/tipos";

// Ações da área de sócios e adeptos (/conta). As permissões estão no RLS:
// um adepto só lê e altera a sua própria linha em public.adeptos.

export async function registarAdepto(_: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const valores = valoresDe(fd);
  delete valores.password;
  delete valores.confirmacao;
  const nome = String(fd.get("nome") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  if (!nome || !email) return { erro: "Preenche o nome e o email.", valores };
  const erroPalavraPasse = validarPalavraPasse(password, String(fd.get("confirmacao") ?? ""));
  if (erroPalavraPasse) return { erro: erroPalavraPasse, valores };
  if (fd.get("aceito_termos") !== "sim") return { erro: "Tens de aceitar a política de privacidade e os termos.", valores };
  if (fd.get("idade_minima") !== "sim") return { erro: "Confirma que tens 13 anos ou autorização dos pais.", valores };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Registo do aceite (RGPD): quando aceitou e que versão da política estava em vigor.
      data: {
        nome: nome.slice(0, 80),
        termos_aceites_em: new Date().toISOString(),
        versao_politica: VERSAO_POLITICA,
        declarou_idade_minima: true,
      },
      // Se o Supabase pedir confirmação do email, o link volta à conta.
      emailRedirectTo: `${await origemDoSite()}/auth/confirm?next=/conta`,
    },
  });
  if (error) {
    const mensagem =
      error.code === "signup_disabled"
        ? "Os registos ainda não estão abertos. Tenta mais tarde."
        : error.code === "weak_password"
          ? "A palavra-passe é fraca. Usa letras minúsculas, maiúsculas e números."
          : error.code === "over_email_send_rate_limit" || error.code === "over_request_rate_limit"
            ? "Demasiados registos seguidos. Espera uns minutos e tenta outra vez."
            : error.code === "email_address_invalid"
              ? "Esse email não é válido."
              : "Não foi possível criar a conta. Verifica os dados e tenta outra vez.";
    return { erro: mensagem, valores };
  }
  // Com confirmação de email ligada, ainda não há sessão: a pessoa tem de abrir o link.
  if (!data.session) {
    return { ok: "Conta criada! Enviámos um email para confirmares o endereço. Depois é só entrar." };
  }
  redirect("/conta");
}

export async function entrarAdepto(_: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const email = String(fd.get("email") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { erro: "Preenche o email e a palavra-passe.", valores: { email } };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      erro: error.code === "email_not_confirmed" ? "Confirma primeiro o teu email (abre o link que te enviámos)." : "Email ou palavra-passe errados.",
      valores: { email },
    };
  }
  redirect("/conta");
}

export async function guardarPerfilAdepto(_: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/conta");

  const { data: escaloes } = await supabase.from("escaloes" as any).select("slug").eq("ativo", true);
  const r = validarPerfilAdepto(
    {
      nome: String(fd.get("nome") ?? ""),
      numero_socio: String(fd.get("numero_socio") ?? ""),
      escaloes: fd.getAll("escaloes").map(String),
    },
    (escaloes ?? []).map((e) => e.slug),
  );
  if (!r.ok) return { erros: r.erros, valores: valoresDe(fd) };

  const { error } = await supabase.from("adeptos" as any).update(r.dados as any).eq("id", auth.user.id);
  if (error) return { erro: "Não foi possível guardar. Tenta outra vez.", valores: valoresDe(fd) };
  // Depois de guardar, entra logo na app (página inicial).
  redirect("/");
}

export async function sairAdepto() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/** RGPD: o adepto apaga a sua própria conta (login e dados). Só contas de adepto; o staff não. */
export async function apagarContaAdepto(_: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  if (fd.get("confirmo") !== "sim") return { erro: "Para apagar, marca a caixa de confirmação." };
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/conta");

  const { error } = await supabase.rpc("apagar_minha_conta");
  if (error) return { erro: "Não foi possível apagar a conta. Tenta outra vez ou fala com o clube." };
  // A conta já não existe: limpa a sessão deste browser.
  await supabase.auth.signOut();
  redirect("/conta/apagada");
}
