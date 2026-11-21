// Variáveis do Supabase.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// Usar secret key no servidor para fazer bypass do RLS
export const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY ?? "";
// Usar publishable key no browser (controlado pelo RLS)
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

export const supabaseConfigurado = Boolean(SUPABASE_URL && SUPABASE_KEY);
