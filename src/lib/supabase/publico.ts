import { createClient as criar } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

// Cliente só de leitura para as páginas públicas: não usa cookies nem sessão,
// por isso corre igual para todos os visitantes (o RLS dá acesso de leitura a "anon").
export function createPublicClient() {
  return criar<Database>(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
