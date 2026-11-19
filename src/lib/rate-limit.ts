import { createClient } from "@/lib/supabase/server";

interface RateLimitRecord {
  key: string;
  attempts: number;
  reset_at: string;
}

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutos
const MAX_ATTEMPTS = 5; // 5 tentativas

export async function checkRateLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const supabase = await createClient();
  const now = new Date();
  const resetAt = new Date(now.getTime() + RATE_LIMIT_WINDOW);

  try {
    // Verificar se existe registo de rate limit
    const { data: existing, error: fetchError } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("key", identifier)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Erro ao verificar rate limit:", fetchError);
      // Em caso de erro, permitir a ação (fail-open)
      return { allowed: true, remaining: MAX_ATTEMPTS, resetAt };
    }

    if (!existing) {
      // Criar novo registo
      const { error: insertError } = await supabase.from("rate_limits").insert({
        key: identifier,
        attempts: 1,
        reset_at: resetAt.toISOString(),
      });

      if (insertError) {
        console.error("Erro ao criar rate limit:", insertError);
        return { allowed: true, remaining: MAX_ATTEMPTS, resetAt };
      }

      return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetAt };
    }

    // Verificar se a janela expirou
    const recordResetAt = new Date(existing.reset_at);
    if (now > recordResetAt) {
      // Janela expirou, resetar
      const { error: updateError } = await supabase
        .from("rate_limits")
        .update({
          attempts: 1,
          reset_at: resetAt.toISOString(),
        })
        .eq("key", identifier);

      if (updateError) {
        console.error("Erro ao resetar rate limit:", updateError);
        return { allowed: true, remaining: MAX_ATTEMPTS, resetAt };
      }

      return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetAt };
    }

    // Incrementar tentativas
    if (existing.attempts >= MAX_ATTEMPTS) {
      return { allowed: false, remaining: 0, resetAt: recordResetAt };
    }

    const { error: incrementError } = await supabase
      .from("rate_limits")
      .update({
        attempts: existing.attempts + 1,
      })
      .eq("key", identifier);

    if (incrementError) {
      console.error("Erro ao incrementar rate limit:", incrementError);
      return { allowed: true, remaining: MAX_ATTEMPTS, resetAt };
    }

    return {
      allowed: existing.attempts + 1 < MAX_ATTEMPTS,
      remaining: Math.max(0, MAX_ATTEMPTS - existing.attempts - 1),
      resetAt: recordResetAt,
    };
  } catch (error) {
    console.error("Erro inesperado em rate limit:", error);
    // Em caso de erro, permitir a ação (fail-open)
    return { allowed: true, remaining: MAX_ATTEMPTS, resetAt };
  }
}

export async function resetRateLimit(identifier: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("rate_limits").delete().eq("key", identifier);
}
