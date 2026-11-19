"use client";

import { useState, useEffect } from "react";
import { generateTOTPSecret, enableTwoFactor, isTwoFactorEnabled } from "@/lib/two-factor";
import { BotaoSubmeter, Mensagem, classeInput } from "./ui";

export function FormConfigurar2FA({ userId }: { userId: string }) {
  const [step, setStep] = useState<"status" | "setup" | "verify" | "complete">("status");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [secret, setSecret] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    checkTwoFAStatus();
  }, [userId]);

  async function checkTwoFAStatus() {
    try {
      const enabled = await isTwoFactorEnabled(userId);
      setTwoFAEnabled(enabled);
    } catch (err) {
      console.error("Erro ao verificar 2FA:", err);
    }
  }

  async function handleGenerateSecret() {
    setLoading(true);
    setError("");

    try {
      const secrets = await generateTOTPSecret("user@fiaes.pt");
      setSecret(secrets.secret);
      setQrCode(secrets.qr_code);
      setBackupCodes(secrets.backup_codes);
      setStep("verify");
    } catch (err) {
      setError("Erro ao gerar secret de autenticação. Tenta novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyAndEnable() {
    setLoading(true);
    setError("");

    try {
      if (!/^\d{6}$/.test(verificationCode)) {
        setError("Código de autenticação inválido (deve ser 6 dígitos).");
        setLoading(false);
        return;
      }

      // Aqui iria verificar o código TOTP
      // Por agora, apenas confirmamos a configuração
      const enabled = await enableTwoFactor(userId, secret, backupCodes);

      if (enabled) {
        setSuccess("2FA ativado com sucesso! Guarda os teus códigos de backup num local seguro.");
        setStep("complete");
        setTwoFAEnabled(true);
      } else {
        setError("Erro ao ativar 2FA. Tenta novamente.");
      }
    } catch (err) {
      setError("Erro durante verificação. Tenta novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (step === "status") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-suave/10 p-4">
          <p className="font-semibold text-white">Status: {twoFAEnabled ? "✅ Ativado" : "❌ Desativado"}</p>
        </div>

        {!twoFAEnabled && (
          <button
            onClick={handleGenerateSecret}
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "A gerar..." : "Ativar 2FA"}
          </button>
        )}
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div className="space-y-4">
        {error && <Mensagem tipo="erro">{error}</Mensagem>}

        <div className="rounded-lg bg-yellow-900/20 p-4 text-sm text-yellow-200">
          <p className="mb-2 font-semibold">🔐 Configurar Autenticação de Dois Fatores</p>
          <ol className="list-inside list-decimal space-y-1">
            <li>Abre Google Authenticator, Authy ou similar</li>
            <li>Digitaliza o código QR abaixo (ou copia o secret manualmente)</li>
            <li>Introduz o código de 6 dígitos gerado</li>
          </ol>
        </div>

        <div className="rounded-lg bg-slate-700 p-4">
          <p className="text-center text-sm font-mono text-slate-300">{secret}</p>
          <p className="mt-2 text-center text-xs text-slate-400">Secret (copia se não consegues digitalizar QR)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Código de Autenticação (6 dígitos)</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className={classeInput + " mt-1"}
          />
        </div>

        <button
          onClick={handleVerifyAndEnable}
          disabled={loading || verificationCode.length !== 6}
          className="w-full rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-500 disabled:opacity-50"
        >
          {loading ? "A verificar..." : "Verificar e Ativar"}
        </button>
      </div>
    );
  }

  if (step === "complete") {
    return (
      <div className="space-y-4">
        {success && <Mensagem tipo="ok">{success}</Mensagem>}

        <div className="rounded-lg bg-yellow-900/20 p-4 text-sm text-yellow-200">
          <p className="mb-2 font-semibold">⚠️ Códigos de Backup</p>
          <p className="mb-2">Guarda estes códigos num local seguro. Cada código pode ser usado uma única vez.</p>
        </div>

        <div className="space-y-1 rounded-lg bg-slate-700 p-4 font-mono text-sm text-slate-300">
          {backupCodes.map((code) => (
            <div key={code}>{code}</div>
          ))}
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(backupCodes.join("\n"));
            alert("Códigos copiados para clipboard!");
          }}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500"
        >
          📋 Copiar Códigos
        </button>

        <button
          onClick={() => {
            setStep("status");
            checkTwoFAStatus();
          }}
          className="w-full rounded-lg bg-slate-700 px-4 py-2 font-semibold text-white hover:bg-slate-600"
        >
          Voltar
        </button>
      </div>
    );
  }

  return null;
}
