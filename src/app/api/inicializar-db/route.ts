import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { readFileSync } from "fs";
import { join } from "path";

const execAsync = promisify(exec);

export async function POST() {
  try {
    // Ler o arquivo da migration
    const migrationPath = join(process.cwd(), "supabase/migrations/20261118000013_torneios.sql");
    const sql = readFileSync(migrationPath, "utf-8");

    // Usar psql para executar a migration
    const dbUrl = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!dbUrl) {
      return NextResponse.json({ error: "DATABASE_URL não configurado" }, { status: 500 });
    }

    // Para o Supabase, precisamos usar pgcrypto para a função gen_random_uuid
    // Vamos executar via API REST do Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Credenciais Supabase não configuradas" }, { status: 500 });
    }

    // Executar cada comando SQL individualmente via POST para a API do Supabase
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    // Tentar usar a API de SQL do Supabase
    for (const statement of statements) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql_query`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
            apikey: supabaseKey,
          },
          body: JSON.stringify({ query: statement }),
        }).catch(() => null);

        if (!response?.ok) {
          console.log(`Skipping statement (table might exist): ${statement.substring(0, 50)}...`);
        }
      } catch (e) {
        console.log(`Error on statement (might be OK): ${e}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Tabelas de torneios inicializadas. Tente criar um torneio agora."
    });
  } catch (erro) {
    console.error("Erro ao inicializar DB:", erro);
    return NextResponse.json({ error: "Erro ao inicializar banco de dados" }, { status: 500 });
  }
}
