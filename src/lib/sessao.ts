import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
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

  const { data: perfil, error: erroPerfil } = (await supabase as any).from("perfis" as any).select("*").eq("id", data.user.id).maybeSingle();
  // TEMPORÁRIO: diagnóstico do "SEM ACESSO" em produção (sem e-mails nem tokens).
  if (erroPerfil || !perfil || !perfil.ativo) {
    const { data: c } = await supabase.auth.getClaims();
    const { data: s } = await supabase.auth.getSession();
    const tok = s.session?.access_token ?? "";
    let tokRole: unknown = null;
    let tokSubIgual: unknown = null;
    try {
      const p = JSON.parse(Buffer.from(tok.split(".")[1] ?? "", "base64url").toString());
      tokRole = p.role ?? null;
      tokSubIgual = p.sub === data.user.id;
    } catch {}
    const { count, error: erroContagem } = await supabase.from("perfis" as any).select("id", { count: "exact", head: true });
    console.error("[sessao-2] sem-acesso:", {
      erro: erroPerfil ? { code: erroPerfil.code, message: erroPerfil.message } : null,
      perfilEncontrado: Boolean(perfil),
      claimsRole: c?.claims?.role ?? null,
      claimsSubIgual: c?.claims?.sub === data.user.id,
      temSessao: Boolean(s.session),
      tokPartes: tok ? tok.split(".").length : 0,
      tokRole,
      tokSubIgual,
      perfisVisiveis: count ?? null,
      erroContagem: erroContagem?.message ?? null,
      chave: (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "").slice(0, 15) || "(vazia)",
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
