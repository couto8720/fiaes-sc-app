import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { SUPABASE_URL } from "./env";

// Chave secreta: ignora o RLS. Usar SÓ no servidor e SÓ depois de confirmar que quem pede é super-admin
// (hoje: convidar utilizadores). Nunca pôr esta variável com o prefixo NEXT_PUBLIC_.
const CHAVE_SECRETA = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const temChaveSecreta = Boolean(CHAVE_SECRETA);

export function createAdminClient() {
  if (!CHAVE_SECRETA) throw new Error("Falta SUPABASE_SECRET_KEY no .env.local.");
  return createClient<Database>(SUPABASE_URL, CHAVE_SECRETA, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
