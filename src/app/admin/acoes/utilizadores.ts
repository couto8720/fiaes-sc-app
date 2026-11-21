"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, temChaveSecreta } from "@/lib/supabase/admin";
import { exigirSuperAdmin, origemDoSite, type Sessao } from "@/lib/sessao";
import { PAPEIS, validarConvite } from "@/lib/validacao";
import { mensagemErroBD, valoresDe, type EstadoFormulario } from "./tipos";
import { logAuditEvent } from "@/lib/audit-log";

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
    // Quem já tem conta (por exemplo, um adepto) não precisa de convite: o super-admin dá-lhe acesso diretamente.
    if (error.code === "email_exists") return promoverContaExistente(sessao, r.dados, escaloesValidos(sessao, fd), valores);
    return { erro: "Não foi possível enviar o convite.", valores };
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

const NOME_PAPEL: Record<(typeof PAPEIS)[number], string> = { super_admin: "super-admin", treinador: "treinador / delegado" };

/**
 * Dá acesso de staff a uma conta que já existe (adepto, ou staff desativado), sem enviar convite.
 * Só é chamada por convidarUtilizador, depois de exigirSuperAdmin(); por isso usa o cliente admin.
 */
async function promoverContaExistente(
  sessao: Sessao,
  dados: { nome: string; email: string; papel: (typeof PAPEIS)[number] },
  escaloes: string[],
  valores: Record<string, string>,
): Promise<EstadoFormulario> {
  const admin = createAdminClient();

  // Procurar a conta pelo email (o clube tem poucas contas; as páginas são de 1000).
  const email = dados.email.toLowerCase();
  let utilizador: { id: string; email?: string } | undefined;
  for (let pagina = 1; !utilizador; pagina++) {
    const { data, error } = await admin.auth.admin.listUsers({ page: pagina, perPage: 1000 });
    if (error) return { erro: "Não foi possível procurar a conta existente.", valores };
    utilizador = data.users.find((u) => u.email?.toLowerCase() === email);
    if (data.users.length < 1000) break;
  }
  if (!utilizador) return { erro: "Já existe uma conta com este email, mas não foi encontrada.", valores };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- "perfis"/"adeptos" com tipos parciais (como no resto do ficheiro)
  const bd = admin as any;
  const { data: perfil } = await bd.from("perfis").select("id, ativo").eq("id", utilizador.id).maybeSingle();
  if (perfil?.ativo) {
    return { erro: "Esta pessoa já faz parte do staff. Para mudar o papel ou os escalões, edita-a na lista de utilizadores.", valores };
  }

  const linha = { id: utilizador.id, nome: dados.nome, email: utilizador.email ?? dados.email, papel: dados.papel, ativo: true };
  const gravar = perfil
    ? await bd.from("perfis").update(linha).eq("id", utilizador.id)
    : await bd.from("perfis").insert(linha);
  if (gravar.error) return { erro: mensagemErroBD(gravar.error), valores };

  await bd.from("perfis_escaloes").delete().eq("perfil_id", utilizador.id);
  if (escaloes.length) {
    const inserir = await bd.from("perfis_escaloes").insert(escaloes.map((escalao_id) => ({ perfil_id: utilizador.id, escalao_id })));
    if (inserir.error) return { erro: mensagemErroBD(inserir.error), valores };
  }
  // Como no convite (promover_convidado): quem passa a staff deixa de ser conta de adepto.
  await bd.from("adeptos").delete().eq("id", utilizador.id);

  await logAuditEvent({
    user_id: sessao.userId,
    action: "user_update",
    resource_type: "perfil",
    resource_id: utilizador.id,
    details: { origem: "conta_existente", papel: dados.papel, reativado: Boolean(perfil) },
    status: "success",
  });

  return {
    ok: `${dados.nome} já tinha conta: ${perfil ? "o acesso foi reativado" : "passou a fazer parte do staff"} como ${NOME_PAPEL[dados.papel]}. Entra com o email e a palavra-passe que já usa.`,
  };
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
