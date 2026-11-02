import { exigirSuperAdmin } from "@/lib/sessao";
import { createClient } from "@/lib/supabase/server";

// Todas as tabelas da app, pela ordem em que se repõem (as que dependem de outras vêm depois).
const TABELAS = [
  "clube_config",
  "escaloes",
  "locais",
  "jogos",
  "golos",
  "expulsoes",
  "classificacoes",
  "perfis",
  "perfis_escaloes",
] as const;

const POR_PEDIDO = 1000; // limite do Supabase por pedido

/**
 * GET /admin/copia — cópia de segurança de todos os dados num ficheiro JSON.
 * Só o super-admin: lê com a sessão dele (o RLS deixa-o ver tudo, incluindo os perfis do staff).
 */
export async function GET() {
  await exigirSuperAdmin();
  const supabase = await createClient();

  const dados: Record<string, unknown[]> = {};
  for (const tabela of TABELAS) {
    const linhas: unknown[] = [];
    for (let desde = 0; ; desde += POR_PEDIDO) {
      const { data, error } = await supabase.from(tabela).select("*").range(desde, desde + POR_PEDIDO - 1);
      if (error) {
        return Response.json({ erro: `Não foi possível ler "${tabela}": ${error.message}` }, { status: 500 });
      }
      linhas.push(...(data ?? []));
      if (!data || data.length < POR_PEDIDO) break;
    }
    dados[tabela] = linhas;
  }

  const agora = new Date();
  const copia = {
    app: "Fiães SC",
    feita_em: agora.toISOString(),
    contagem: Object.fromEntries(Object.entries(dados).map(([t, l]) => [t, l.length])),
    dados,
  };
  const dia = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon" }).format(agora);

  return new Response(JSON.stringify(copia, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="copia-fiaes-sc-${dia}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
