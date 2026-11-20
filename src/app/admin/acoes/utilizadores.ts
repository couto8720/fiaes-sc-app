"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, temChaveSecreta } from "@/lib/supabase/admin";
import { exigirSuperAdmin, origemDoSite, type Sessao } from "@/lib/sessao";
import { PAPEIS, validarConvite } from "@/lib/validacao";
import { mensagemErroBD, valoresDe, type EstadoFormulario } from "./tipos";

/** Só aceita ids de escalões que existem (a sessão do super-admin tem a lista completa). */
const escaloesValidos = (s: Sessao, fd: FormData) =>
  fd.getAll("escaloes").map(String).filter((id) => s.escaloes.some((e) => e.id === id));

export async function convidarUtilizador(_: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const sessao = await exigirSuperAdmin();
  const valores = valoresDe(fd);
  const r = validarConvite(valores);
  if (!r.ok) return { erros: r.erros, valores };
  if (!temChaveSecreta) {
    return { erro: "Para enviar convites falta a SUPABASE_SECRET_KEY no .env.local (ver README).", valores };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(r.dados.email, {
    data: { nome: r.dados.nome },
    // O convite chega com a sessão no fragmento do URL (#access_token=…), que só o browser lê.
    redirectTo: `${await origemDoSite()}/auth/convite`,
  });
  if (error) {
    return {
      erro: error.code === "email_exists" ? "Já existe uma conta com este email." : "Não foi possível enviar o convite.",
      valores,
    };
  }

  // O perfil é criado pelo trigger da BD; aqui só se acertam o papel e os escalões.
  // (Cliente admin porque a sessão do super-admin já foi confirmada acima.)
  const userId = data.user.id;
  await admin.from("perfis" as any).update({ nome: r.dados.nome, papel: r.dados.papel } as any).eq("id", userId);
  const escaloes = escaloesValidos(sessao, fd);
  if (escaloes.length) {
    await admin.from("perfis_escaloes" as any).insert(escaloes.map((escalao_id) => ({ perfil_id: userId, escalao_id })) as any);
  }
  return { ok: `Convite enviado para ${r.dados.email}.` };
}

export async function atualizarUtilizador(_: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const sessao = await exigirSuperAdmin();
  const valores = valoresDe(fd);
  const id = valores.id;
  const nome = (valores.nome ?? "").trim();
  const papel = valores.papel as (typeof PAPEIS)[number];
  const ativo = valores.ativo === "on";

  if (!nome) return { erros: { nome: "Indica o nome." }, valores };
  if (!PAPEIS.includes(papel)) return { erros: { papel: "Papel inválido." }, valores };
  if (id === sessao.userId && (papel !== "super_admin" || !ativo)) {
    return { erro: "Não podes retirar o teu próprio acesso de super-admin (pede a outro super-admin).", valores };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("perfis" as any).update({ nome, papel, ativo } as any).eq("id", id).select("id");
  if (error) return { erro: mensagemErroBD(error), valores };
  if (!data?.length) return { erro: "Utilizador não encontrado.", valores };

  // Substitui as atribuições pelas escolhidas no formulário.
  const escaloes = escaloesValidos(sessao, fd);
  const apagar = await supabase.from("perfis_escaloes" as any).delete().eq("perfil_id", id);
  if (apagar.error) return { erro: mensagemErroBD(apagar.error), valores };
  if (escaloes.length) {
    const inserir = await supabase
      .from("perfis_escaloes" as any)
      .insert(escaloes.map((escalao_id) => ({ perfil_id: id, escalao_id })) as any);
    if (inserir.error) return { erro: mensagemErroBD(inserir.error), valores };
  }
  redirect("/admin/utilizadores");
}
