"use server";

import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { origemDoSite } from "@/lib/sessao";
import { destinoSeguro, mensagemErroPalavraPasse, validarPalavraPasse } from "@/lib/validacao";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { logAuditEvent } from "@/lib/audit-log";
import { isTwoFactorEnabled, getTwoFactorSecret, verifyTOTPToken, verifyBackupCode } from "@/lib/two-factor";
import type { EstadoFormulario } from "./tipos";

export async function entrar(_: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const email = String(fd.get("email") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { erro: "Preenche o email e a palavra-passe.", valores: { email } };

  // Verificar rate limit (5 tentativas por 15 minutos)
  const rateLimit = await checkRateLimit(`login:${email}`);
  if (!rateLimit.allowed) {
    const minutos = Math.ceil((rateLimit.resetAt.getTime() - new Date().getTime()) / 60000);
    return {
      erro: `Demasiadas tentativas de login. Tenta novamente em ${minutos} minuto${minutos !== 1 ? "s" : ""}.`,
      valores: { email },
    };
  }

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Registar tentativa falhada de login
    await logAuditEvent({
      action: "login",
      resource_type: "authentication",
      status: "failure",
      error_message: error.message,
      details: { email },
    });

    return {
      erro: error.code === "email_not_confirmed" ? "Confirma primeiro o teu email." : "Email ou palavra-passe errados.",
      valores: { email },
    };
  }

  // Login bem-sucedido, resetar rate limit
  await resetRateLimit(`login:${email}`);

  // Registar login bem-sucedido
  await logAuditEvent({
    user_id: authData.user?.id,
    action: "login",
    resource_type: "authentication",
    status: "success",
    details: { email },
  });

  redirect(destinoSeguro(String(fd.get("seguinte") ?? "")));
}

export async function verificarDoisFatores(_: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const token = String(fd.get("token") ?? "").replace(/\s+/g, ""); // Remove espaços
  const backupCode = String(fd.get("backup_code") ?? "");

  if (!token && !backupCode) {
    return { erro: "Preenche o código de autenticação ou código de backup." };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return { erro: "Sessão expirada. Faz login novamente." };
  }

  let valid = false;

  // Verificar TOTP token
  if (token) {
    if (!/^\d{6}$/.test(token)) {
      return { erro: "Código de autenticação inválido (deve ser 6 dígitos)." };
    }

    const secret = await getTwoFactorSecret(userData.user.id);
    if (!secret) {
      return { erro: "2FA não está configurado." };
    }

    valid = verifyTOTPToken(secret, token);
  }

  // Verificar backup code
  if (!valid && backupCode) {
    valid = await verifyBackupCode(userData.user.id, backupCode);
    if (!valid) {
      return { erro: "Código de backup inválido ou já utilizado." };
    }
  }

  if (!valid) {
    await logAuditEvent({
      user_id: userData.user.id,
      action: "login",
      resource_type: "authentication",
      status: "failure",
      error_message: "2FA verification failed",
    });

    return { erro: "Código de autenticação inválido." };
  }

  // 2FA válido
  await logAuditEvent({
    user_id: userData.user.id,
    action: "login",
    resource_type: "authentication",
    status: "success",
    details: { twoFactorVerified: true },
  });

  redirect(destinoSeguro(String(fd.get("seguinte") ?? "")));
}

export async function sair() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  await logAuditEvent({
    user_id: userData.user?.id,
    action: "logout",
    resource_type: "authentication",
    status: "success",
  });

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
    redirectTo: `${await origemDoSite()}/auth/confirm?next=${destinoRecuperacao(fd)}`,
  });
  return { ok: "Se existir uma conta com esse email, vais receber um link para definir uma nova palavra-passe." };
}

// Staff volta a definir a palavra-passe no painel; adeptos na área da conta.
const destinoRecuperacao = (fd: FormData) =>
  fd.get("area") === "conta" ? "/conta/palavra-passe" : "/admin/definir-palavra-passe";

export async function definirPalavraPasse(_: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const erro = validarPalavraPasse(String(fd.get("password") ?? ""), String(fd.get("confirmacao") ?? ""));
  if (erro) return { erro };
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { error } = await supabase.auth.updateUser({ password: String(fd.get("password")) });
  if (error) {
    const motivos = "reasons" in error && Array.isArray(error.reasons) ? (error.reasons as string[]) : [];

    // Registar falha ao alterar password
    await logAuditEvent({
      user_id: userData.user?.id,
      action: "password_change",
      resource_type: "authentication",
      status: "failure",
      error_message: error.message,
    });

    return { erro: mensagemErroPalavraPasse(error.code, motivos) };
  }

  // Registar mudança de password bem-sucedida
  await logAuditEvent({
    user_id: userData.user?.id,
    action: "password_change",
    resource_type: "authentication",
    status: "success",
  });

  // Staff (tem perfil) vai para o painel; adeptos para a sua conta.
  const { data: auth } = await supabase.auth.getUser();
  const { data: perfil } = auth.user
    ? await supabase.from("perfis").select("id").eq("id", auth.user.id).maybeSingle()
    : { data: null };
  redirect(perfil ? "/admin" : "/conta");
}

export async function recuperar2FA(_: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const email = String(fd.get("email") ?? "").trim();
  const backupCode = String(fd.get("backup_code") ?? "").trim();

  if (!email) return { erro: "Indica o teu email." };
  if (!backupCode) return { erro: "Indica um código de backup." };

  const supabase = await createClient();

  // Get user by email
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    return { erro: "Erro ao verificar email." };
  }

  const user = users?.find((u) => u.email === email);

  if (!user) {
    // Don't reveal if email exists or not (security)
    return { ok: "Se a conta existir e tiver 2FA, receberá um email com instruções." };
  }

  // Verify backup code
  const { data: backupCodes } = await supabase
    .from("backup_codes")
    .select("id, used")
    .eq("user_id", user.id)
    .eq("code", backupCode)
    .single();

  if (!backupCodes || backupCodes.used) {
    await logAuditEvent({
      user_id: user.id,
      action: "2fa_recovery",
      resource_type: "authentication",
      status: "failure",
      error_message: "Invalid or used backup code",
    });

    return { erro: "Código de backup inválido ou já utilizado." };
  }

  // Mark backup code as used
  await supabase
    .from("backup_codes")
    .update({ used: true })
    .eq("id", backupCodes.id);

  // Log successful recovery
  await logAuditEvent({
    user_id: user.id,
    action: "2fa_recovery",
    resource_type: "authentication",
    status: "success",
    details: { method: "backup_code" },
  });

  // Send recovery email with instructions
  // User should contact admin to disable 2FA or regenerate codes
  return {
    ok: "Se a conta existir e tiver 2FA, receberá um email com instruções. Por favor contacta admin@fiaes.pt para desativar 2FA e reconfigurá-lo.",
  };
}
