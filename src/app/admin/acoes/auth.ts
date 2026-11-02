"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { origemDoSite } from "@/lib/sessao";
import { destinoSeguro, mensagemErroPalavraPasse, validarPalavraPasse } from "@/lib/validacao";
import type { EstadoFormulario } from "./tipos";

export async function entrar(_: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const email = String(fd.get("email") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { erro: "Preenche o email e a palavra-passe.", valores: { email } };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      erro: error.code === "email_not_confirmed" ? "Confirma primeiro o teu email." : "Email ou palavra-passe errados.",
      valores: { email },
    };
  }
  redirect(destinoSeguro(String(fd.get("seguinte") ?? "")));
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function pedirRecuperacao(_: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const email = String(fd.get("email") ?? "").trim();
  if (!email) return { erro: "Indica o teu email." };
  const supabase = await createClient();
  // A resposta é sempre a mesma, exista ou não a conta (não revela que emails estão registados).
  // O link do email volta a /auth/confirm com ?code=… (fluxo PKCE: o verificador fica num cookie
  // deste browser), que inicia a sessão e segue para a página de definir a palavra-passe.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origemDoSite()}/auth/confirm?next=/admin/definir-palavra-passe`,
  });
  return { ok: "Se existir uma conta com esse email, vais receber um link para definir uma nova palavra-passe." };
}

export async function definirPalavraPasse(_: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const erro = validarPalavraPasse(String(fd.get("password") ?? ""), String(fd.get("confirmacao") ?? ""));
  if (erro) return { erro };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: String(fd.get("password")) });
  if (error) {
    const motivos = "reasons" in error && Array.isArray(error.reasons) ? (error.reasons as string[]) : [];
    return { erro: mensagemErroPalavraPasse(error.code, motivos) };
  }
  redirect("/admin");
}
