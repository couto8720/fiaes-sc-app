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

  const { data: perfil } = await supabase.from("perfis").select("*").eq("id", data.user.id).maybeSingle();
  if (!perfil || !perfil.ativo) return { tipo: "sem-acesso" };

  const superAdmin = perfil.papel === "super_admin";
  let escaloes: Escalao[];
  if (superAdmin) {
    const { data: todos } = await supabase.from("escaloes").select("*").order("ordem");
    escaloes = todos ?? [];
  } else {
    const { data: atribuidos } = await supabase
      .from("perfis_escaloes")
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
