"use client";

import { useActionState, useState } from "react";
import type { Perfil } from "@/lib/supabase/database.types";
import { atualizarUtilizador } from "@/app/admin/acoes/utilizadores";
import { BotaoSubmeter, Campo, Mensagem, classeInput } from "@/components/admin/ui";
import type { EstadoFormulario } from "@/app/admin/acoes/tipos";

interface EditorUtilizadorProps {
  utilizador?: Perfil;
}

export function EditorUtilizador({ utilizador }: EditorUtilizadorProps) {
  const [estado, acao] = useActionState(atualizarUtilizador, { valores: utilizador } as EstadoFormulario);

  return (
    <form action={acao} className="space-y-6 max-w-2xl">
      {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
      {estado.ok && <Mensagem tipo="ok">{estado.ok}</Mensagem>}

      <input type="hidden" name="id" value={utilizador?.id || ""} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Campo rotulo="Nome Completo" nome="nome" obrigatorio>
          <input
            id="nome"
            name="nome"
            type="text"
            required
            defaultValue={utilizador?.nome || ""}
            className={classeInput}
          />
        </Campo>

        <Campo rotulo="Email" nome="email" obrigatorio>
          <input
            id="email"
            name="email"
            type="email"
            required
            disabled={!!utilizador}
            defaultValue={utilizador?.email || ""}
            className={classeInput + (utilizador ? " opacity-50" : "")}
          />
        </Campo>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Campo rotulo="Cargo" nome="cargo" obrigatorio>
          <select name="cargo" defaultValue={utilizador?.cargo || "viewer"} className={classeInput}>
            <option value="viewer">Visualizador</option>
            <option value="editor">Editor</option>
            <option value="admin">Administrador</option>
          </select>
        </Campo>

        <Campo rotulo="Escalões" nome="escaloes_ids">
          <input
            id="escaloes_ids"
            name="escaloes_ids"
            type="text"
            placeholder="IDs separados por vírgula (deixar vazio para todos)"
            defaultValue={(utilizador?.escaloes_ids || []).join(", ")}
            className={classeInput}
          />
        </Campo>
      </div>

      <div className="flex items-center space-x-3 bg-site/50 p-4 rounded border border-borda">
        <input
          id="ativo"
          name="ativo"
          type="checkbox"
          defaultChecked={utilizador?.ativo ?? true}
          className="w-5 h-5 cursor-pointer"
        />
        <label htmlFor="ativo" className="cursor-pointer">
          <strong>Ativo</strong> - Utilizador pode fazer login
        </label>
      </div>

      <div className="bg-suave/10 p-4 rounded border border-borda">
        <p className="text-sm mb-2">
          <strong>Notas:</strong>
        </p>
        <ul className="text-sm text-suave space-y-1 list-disc list-inside">
          <li>O email não pode ser alterado (gerido pelo Supabase Auth)</li>
          <li>Desativar um utilizador remove-lhe acesso imediato</li>
          <li>Cargo "admin" dá acesso a todas as funcionalidades</li>
          <li>"Escalões" restringe a quais grupos pode aceder (deixar vazio = acesso a todos)</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <BotaoSubmeter>Guardar Alterações</BotaoSubmeter>
        <a href="/admin/utilizadores" className="px-4 py-2 rounded border border-borda hover:bg-site text-center">
          Cancelar
        </a>
      </div>
    </form>
  );
}
