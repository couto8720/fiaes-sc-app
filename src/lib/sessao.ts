import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";
import { supabaseConfigurado } from "./supabase/env";
import type { Escalao, Perfil } from "./supabase/database.types";

export type Sessao = {
  userId: string;
  perfil: Perfil;
  superAdmin: boolean;
  /** Escalões que este utilizador pode gerir (todos, se for super-admin). */
  escaloes: Escalao[];
};

type Estado = { tipo: "anonimo" } | { tipo: "sem-acesso" } | { tipo: "ok"; sessao: Sessao };

// Uma leitura por pedido, partilhada por layout, páginas e ações.
const lerSessao = cache(async (): Promise<Estado> => {
  // A biblioteca do Supabase consulta a hora (validade da sessão): marca o render como "por pedido".
  await connection();
  if (!supabaseConfigurado) return { tipo: "anonimo" };
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { tipo: "anonimo" };

  // O getUser() acima já validou o utilizador no servidor de Auth. O perfil é lido pelo id dele com o
  // cliente admin, porque a leitura com o cliente de sessão vinha vazia em produção (causa por apurar).
  const { data: perfil, error: erroPerfil } = await (createAdminClient() as any)
    .from("perfis")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle();
  if (erroPerfil) console.error("[sessao] erro ao ler perfil:", { code: erroPerfil.code, message: erroPerfil.message });

  // TEMPORÁRIO: comparar com o cliente de sessão para perceber a causa (sem e-mails nem tokens).
  if (perfil) {
    const a = await (supabase as any).from("perfis").select("*").eq("id", data.user.id).maybeSingle();
    const b = await (supabase as any).from("perfis").select("id,ativo,papel").eq("id", data.user.id);
    const c = await (supabase as any).from("perfis").select("*").eq("id", data.user.id);
    const d = await (supabase as any).from("perfis").select("id");
    console.error("[sessao-3] comparacao:", {
      adminEncontrou: true,
      sessaoMaybeSingle: { tem: Boolean(a.data), status: a.status, erro: a.error?.message ?? null },
      sessaoColunas: { linhas: b.data?.length ?? null, status: b.status, erro: b.error?.message ?? null },
      sessaoTodasColunas: { linhas: c.data?.length ?? null, status: c.status, erro: c.error?.message ?? null },
      sessaoSemFiltro: { linhas: d.data?.length ?? null, contemProprio: (d.data ?? []).some((r: any) => r.id === data.user.id), status: d.status },
    });
  }
  if (!perfil || !perfil.ativo) return { tipo: "sem-acesso" };

  const superAdmin = perfil.papel === "super_admin";
  let escaloes: Escalao[];
  if (superAdmin) {
    const { data: todos } = await supabase.from("escaloes" as any).select("*").order("ordem");
    escaloes = todos ?? [];
  } else {
    const { data: atribuidos } = await supabase
      .from("perfis_escaloes" as any)
      .select("escalao:escaloes(*)")
      .eq("perfil_id", perfil.id);
    escaloes = (atribuidos ?? [])
      .map((a) => a.escalao)
      .filter((e): e is Escalao => e !== null)
      .sort((a, b) => a.ordem - b.ordem);
  }

  return { tipo: "ok", sessao: { userId: data.user.id, perfil, superAdmin, escaloes } };
});

/** Para páginas e ações do painel: devolve a sessão ou redireciona (login / sem acesso). */
export async function exigirSessao(): Promise<Sessao> {
  const estado = await lerSessao();
  if (estado.tipo === "anonimo") redirect("/admin/login");
  if (estado.tipo === "sem-acesso") redirect("/admin/sem-acesso");
  return estado.sessao;
}

export async function exigirSuperAdmin(): Promise<Sessao> {
  const sessao = await exigirSessao();
  if (!sessao.superAdmin) redirect("/admin");
  return sessao;
}

export const podeEditarEscalao = (s: Sessao, escalaoId: string) =>
  s.superAdmin || s.escaloes.some((e) => e.id === escalaoId);

/** Endereço público do site (para links nos emails de convite e recuperação). */
export async function origemDoSite() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
