import { createClient } from "@/lib/supabase/server";

// Usar crypto nativo do Node.js para TOTP
// Alternative: usar `speakeasy` package se necessário

interface TOTPSecret {
  secret: string;
  qr_code: string;
  backup_codes: string[];
}

interface VerificationResult {
  valid: boolean;
  backupCodeUsed?: boolean;
}

/**
 * Gera um secret TOTP e QR code para 2FA
 * @param email Email do utilizador (usado no label do QR code)
 */
export async function generateTOTPSecret(email: string): Promise<TOTPSecret> {
  // Para simplificar, usamos uma versão básica de TOTP
  // Em produção, usar `speakeasy` ou `authenticator`
  const secret = generateRandomSecret(32);
  const backupCodes = generateBackupCodes(8);

  // Formato para Google Authenticator: otpauth://totp/...
  const otpauthUrl = `otpauth://totp/Fiães%20SC:${encodeURIComponent(email)}?secret=${secret}&issuer=Fiães%20SC`;

  // Em produção, gerar QR code com bibliotecas como qrcode
  // Para agora, apenas armazenar a URL
  const qrCode = otpauthUrl;

  return {
    secret,
    qr_code: qrCode,
    backup_codes: backupCodes,
  };
}

/**
 * Verifica um código TOTP
 * @param secret Secret armazenado
 * @param token Código de 6 dígitos do utilizador
 */
export function verifyTOTPToken(secret: string, token: string): boolean {
  // Validar formato do token
  if (!/^\d{6}$/.test(token)) {
    return false;
  }

  // Implementação TOTP básica
  // Em produção, usar `speakeasy.totp.verify()`
  const counter = Math.floor(Date.now() / 30000); // 30 segundo time steps

  // Verificar token atual e ±1 step anterior/seguinte (para sincronização)
  for (let i = -1; i <= 1; i++) {
    const expectedToken = generateTOTPToken(secret, counter + i);
    if (expectedToken === token) {
      return true;
    }
  }

  return false;
}

/**
 * Verifica um backup code e marca como usado
 */
export async function verifyBackupCode(userId: string, backupCode: string): Promise<boolean> {
  const supabase = await createClient();

  // Procurar por backup code não usado
  const { data: code, error } = await supabase
    .from("backup_codes")
    .select("*")
    .eq("user_id", userId)
    .eq("code", backupCode)
    .eq("used", false)
    .single();

  if (error || !code) {
    return false;
  }

  // Marcar como usado
  const { error: updateError } = await supabase
    .from("backup_codes")
    .update({ used: true, used_at: new Date().toISOString() })
    .eq("id", code.id);

  return !updateError;
}

/**
 * Habilita 2FA para utilizador
 */
export async function enableTwoFactor(userId: string, secret: string, backupCodes: string[]): Promise<boolean> {
  const supabase = await createClient();

  // Armazenar secret
  const { error: secretError } = await supabase.from("two_factor_secrets").upsert({
    user_id: userId,
    secret,
    enabled: true,
    created_at: new Date().toISOString(),
  });

  if (secretError) {
    console.error("Erro ao armazenar 2FA secret:", secretError);
    return false;
  }

  // Armazenar backup codes
  const backupCodeRecords = backupCodes.map((code) => ({
    user_id: userId,
    code,
    used: false,
  }));

  const { error: codesError } = await supabase.from("backup_codes").insert(backupCodeRecords);

  if (codesError) {
    console.error("Erro ao armazenar backup codes:", codesError);
    return false;
  }

  return true;
}

/**
 * Desabilita 2FA para utilizador
 */
export async function disableTwoFactor(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error: secretError } = await supabase
    .from("two_factor_secrets")
    .update({ enabled: false })
    .eq("user_id", userId);

  if (secretError) {
    return false;
  }

  // Remover backup codes não usados
  await supabase.from("backup_codes").delete().eq("user_id", userId).eq("used", false);

  return true;
}

/**
 * Verifica se 2FA está ativado para utilizador
 */
export async function isTwoFactorEnabled(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("two_factor_secrets")
    .select("enabled")
    .eq("user_id", userId)
    .eq("enabled", true)
    .single();

  return !error && data?.enabled === true;
}

/**
 * Obtém secret para verificação
 */
export async function getTwoFactorSecret(userId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("two_factor_secrets")
    .select("secret")
    .eq("user_id", userId)
    .eq("enabled", true)
    .single();

  return data?.secret || null;
}

// --- Funções Auxiliares ---

function generateRandomSecret(length: number): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; // RFC 4648 Base32
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function generateBackupCodes(count: number): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Formato: XXXX-XXXX (8 caracteres cada)
    const code = Array(2)
      .fill(0)
      .map(() => generateRandomSecret(4))
      .join("-");
    codes.push(code);
  }
  return codes;
}

/**
 * Gera token TOTP baseado em HMAC-SHA1
 * Implementação simplificada (em produção usar speakeasy)
 */
function generateTOTPToken(secret: string, counter: number): string {
  // Implementação TOTP simplificada
  // Em produção: usar `speakeasy.totp({ secret, encoding: 'base32' })`
  const hash = require("crypto").createHmac("sha1", Buffer.from(secret, "base32"));
  hash.update(Buffer.alloc(8, 0));
  hash.update(counter.toString());

  const digest = hash.digest();
  const offset = digest[digest.length - 1] & 0xf;
  const truncated = (digest[offset] & 0x7f) << 24 | (digest[offset + 1] & 0xff) << 16 | (digest[offset + 2] & 0xff) << 8 | digest[offset + 3] & 0xff;

  return (truncated % 1000000).toString().padStart(6, "0");
}
