import { createClient } from "@/lib/supabase/server";

interface RateLimitRecord {
  key: string;
  attempts: number;
  reset_at: string;
}

export interface RateLimitConfig {
  window: number; // milliseconds
  max: number; // max attempts
}

const DEFAULT_LIMIT: RateLimitConfig = {
  window: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
};

const ENDPOINT_LIMITS: Record<string, RateLimitConfig> = {
  "login": { window: 15 * 60 * 1000, max: 5 },
  "api": { window: 60 * 1000, max: 100 }, // 100 requests per minute
  "tournament-create": { window: 60 * 60 * 1000, max: 50 }, // 50 per hour
  "game-update": { window: 60 * 1000, max: 300 }, // 300 per minute
};

export async function checkRateLimit(
  identifier: string,
  endpoint?: string
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const supabase = await createClient();
  const config = endpoint ? ENDPOINT_LIMITS[endpoint] ?? DEFAULT_LIMIT : DEFAULT_LIMIT;
  const now = new Date();
  const resetAt = new Date(now.getTime() + config.window);

  try {
    // Verificar se existe registo de rate limit
    const { data: existing, error: fetchError } = await supabase
      .from("rate_limits" as any)
      .select("*" as any)
      .eq("key", identifier)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Erro ao verificar rate limit:", fetchError);
      // Em caso de erro, permitir a ação (fail-open)
      return { allowed: true, remaining: config.max, resetAt };
    }

    if (!existing) {
      // Criar novo registo
      const { error: insertError } = await supabase.from("rate_limits" as any).insert({
        key: identifier,
        attempts: 1,
        reset_at: resetAt.toISOString(),
      });

      if (insertError) {
        console.error("Erro ao criar rate limit:", insertError);
        return { allowed: true, remaining: config.max, resetAt };
      }

      return { allowed: true, remaining: config.max - 1, resetAt };
    }

    // Verificar se a janela expirou
    const recordResetAt = new Date(existing.reset_at);
    if (now > recordResetAt) {
      // Janela expirou, resetar
      const { error: updateError } = await supabase
        .from("rate_limits" as any)
        .update({
          attempts: 1,
          reset_at: resetAt.toISOString(),
        })
        .eq("key", identifier);

      if (updateError) {
        console.error("Erro ao resetar rate limit:", updateError);
        return { allowed: true, remaining: config.max, resetAt };
      }

      return { allowed: true, remaining: config.max - 1, resetAt };
    }

    // Incrementar tentativas
    if (existing.attempts >= config.max) {
      return { allowed: false, remaining: 0, resetAt: recordResetAt };
    }

    const { error: incrementError } = await supabase
      .from("rate_limits" as any)
      .update({
        attempts: existing.attempts + 1,
      })
      .eq("key", identifier);

    if (incrementError) {
      console.error("Erro ao incrementar rate limit:", incrementError);
      return { allowed: true, remaining: config.max, resetAt };
    }

    return {
      allowed: existing.attempts + 1 < config.max,
      remaining: Math.max(0, config.max - existing.attempts - 1),
      resetAt: recordResetAt,
    };
  } catch (error) {
    console.error("Erro inesperado em rate limit:", error);
    // Em caso de erro, permitir a ação (fail-open)
    return { allowed: true, remaining: config.max, resetAt };
  }
}

export async function resetRateLimit(identifier: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("rate_limits" as any).delete().eq("key", identifier);
}
