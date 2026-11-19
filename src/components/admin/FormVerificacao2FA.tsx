"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { verificarDoisFatores } from "@/app/admin/acoes/auth";
import { ESTADO_INICIAL } from "@/app/admin/acoes/tipos";
import { BotaoSubmeter, Campo, Mensagem, classeInput } from "./ui";

export function FormVerificacao2FA() {
  const params = useSearchParams();
  const [estado, acao] = useActionState(verificarDoisFatores, ESTADO_INICIAL);

  return (
    <form action={acao} className="space-y-4">
      {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
      {estado.ok && <Mensagem tipo="ok">{estado.ok}</Mensagem>}

      <input type="hidden" name="seguinte" value={params.get("seguinte") ?? ""} />

      <div className="rounded-lg bg-suave/10 p-4 text-sm">
        <p className="mb-2 font-semibold text-white">🔐 Autenticação de Dois Fatores</p>
        <p>Introduz o código de 6 dígitos da tua aplicação de autenticação (Google Authenticator, Authy, etc).</p>
      </div>

      <Campo rotulo="Código de Autenticação" nome="token">
        <input
          id="token"
          name="token"
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          placeholder="000000"
          required
          autoFocus
          className={classeInput}
        />
      </Campo>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-suave/20" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-site px-2 text-suave">OU</span>
        </div>
      </div>

      <Campo rotulo="Código de Backup" nome="backup_code">
        <input id="backup_code" name="backup_code" type="text" placeholder="XXXX-XXXX" className={classeInput} />
      </Campo>

      <BotaoSubmeter>Verificar</BotaoSubmeter>

      <p className="text-xs text-suave">
        Se perdeste acesso ao teu dispositivo de autenticação, usa um dos teus códigos de backup.
      </p>
    </form>
  );
}
