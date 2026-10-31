import type { NextRequest } from "next/server";
import { createPublicClient } from "@/lib/supabase/publico";
import { supabaseConfigurado } from "@/lib/supabase/env";

// Chamada de 3 em 3 dias pelo Vercel Cron (vercel.json). No plano gratuito, o Supabase pausa
// o projeto ao fim de 7 dias sem atividade (ex.: nas férias de verão); uma leitura simples evita isso.
// O Vercel envia "Authorization: Bearer <CRON_SECRET>"; sem esse segredo, o pedido é recusado.
export async function GET(request: NextRequest) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || request.headers.get("authorization") !== `Bearer ${segredo}`) {
    return Response.json({ ok: false, erro: "não autorizado" }, { status: 401 });
  }
  if (!supabaseConfigurado) return Response.json({ ok: true, nota: "Supabase não configurado" });

  const { error } = await createPublicClient().from("escaloes").select("id").limit(1);
  return Response.json({ ok: !error, em: new Date().toISOString() }, { status: error ? 502 : 200 });
}
