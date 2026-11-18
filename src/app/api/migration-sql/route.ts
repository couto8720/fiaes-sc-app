import { readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const migrationPath = join(process.cwd(), "supabase/migrations/20261118000013_torneios.sql");
    const sql = readFileSync(migrationPath, "utf-8");

    return new NextResponse(sql, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      }
    });
  } catch (erro) {
    return NextResponse.json({ error: "Erro ao ler migration" }, { status: 500 });
  }
}
