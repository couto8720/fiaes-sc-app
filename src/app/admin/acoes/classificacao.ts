"use server";

import { createClient } from "@/lib/supabase/server";
import { exigirSessao, podeEditarEscalao } from "@/lib/sessao";
import { validarClassificacao } from "@/lib/validacao";
import { mensagemErroBD, type EstadoFormulario } from "./tipos";

export async function guardarClassificacao(_: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const sessao = await exigirSessao();
  const escalaoId = String(fd.get("escalao_id") ?? "");
  if (!podeEditarEscalao(sessao, escalaoId)) return { erro: "Não tens permissão para este escalão." };

  let entrada: unknown;
  try {
    entrada = JSON.parse(String(fd.get("linhas") ?? "[]"));
  } catch {
    return { erro: "Dados inválidos." };
  }
  const r = validarClassificacao(entrada);
  if (!r.ok) return { erro: `Corrige a tabela: ${r.erros.tabela}.` };

  const supabase = await createClient();
  const { error } = await supabase.rpc("substituir_classificacao", { p_escalao: escalaoId, p_linhas: r.dados });
  if (error) return { erro: mensagemErroBD(error) };
  return { ok: `Classificação guardada (${r.dados.length} equipas). Já está no site.` };
}
