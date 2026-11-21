import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

// RGPD (direito de acesso e portabilidade): o adepto descarrega, num ficheiro JSON,
// tudo o que a app guarda sobre ele. Só funciona com sessão e só devolve os dados de quem pede (RLS).
export async function GET() {
  await connection(); // dados por utilizador: nunca pré-gerar no build
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new Response("Sem sessão.", { status: 401 });

  // "adeptos" ainda não está em database.types.ts (como no resto de /conta).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: adepto } = await (supabase as any).from("adeptos").select("*").eq("id", auth.user.id).maybeSingle();
  const u = auth.user;
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;

  const dados = {
    exportado_em: new Date().toISOString(),
    conta: {
      id: u.id,
      email: u.email,
      criada_em: u.created_at,
      ultimo_acesso: u.last_sign_in_at ?? null,
      email_confirmado_em: u.email_confirmed_at ?? null,
    },
    aceitacao: {
      termos_aceites_em: meta.termos_aceites_em ?? null,
      versao_politica: meta.versao_politica ?? null,
      declarou_idade_minima: meta.declarou_idade_minima ?? null,
    },
    perfil_adepto: adepto ?? null,
  };

  return new Response(JSON.stringify(dados, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="os-meus-dados-fiaes-sc.json"',
      "Cache-Control": "private, no-store",
    },
  });
}
