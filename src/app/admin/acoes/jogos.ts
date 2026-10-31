"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { exigirSessao, podeEditarEscalao } from "@/lib/sessao";
import { validarJogo } from "@/lib/validacao";
import { mensagemErroBD, valoresDe, type EstadoFormulario } from "./tipos";

export async function guardarJogo(_: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const sessao = await exigirSessao();
  const valores = valoresDe(fd);
  const r = validarJogo(valores);
  if (!r.ok) return { erros: r.erros, erro: "Corrige os campos assinalados.", valores };

  const { novo_local, ...dados } = r.dados;
  // Verificação rápida para dar uma mensagem clara; o RLS volta a verificar na BD.
  if (!podeEditarEscalao(sessao, dados.escalao_id)) {
    return { erro: "Não tens permissão para gerir jogos deste escalão.", valores };
  }

  const supabase = await createClient();

  if (novo_local) {
    const { data: local, error } = await supabase.from("locais").insert({ nome: novo_local }).select("id").single();
    if (error) return { erro: mensagemErroBD(error), valores };
    dados.local_id = local.id;
  }

  const id = valores.id;
  const { data, error } = id
    ? await supabase.from("jogos").update(dados).eq("id", id).select("id")
    : await supabase.from("jogos").insert(dados).select("id");

  if (error) return { erro: mensagemErroBD(error), valores };
  if (!data?.length) return { erro: "O jogo não existe ou não tens permissão para o alterar.", valores };

  redirect(`/admin?escalao=${dados.escalao_id}`);
}

export async function apagarJogo(fd: FormData) {
  await exigirSessao();
  const supabase = await createClient();
  await supabase.from("jogos").delete().eq("id", String(fd.get("id")));
  redirect("/admin");
}
