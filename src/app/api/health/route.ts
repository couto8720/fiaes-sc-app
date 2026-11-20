import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  services: {
    database: "ok" | "error";
    auth: "ok" | "error";
  };
  version: string;
  uptime?: number;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const health: HealthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      database: "ok",
      auth: "ok",
    },
    version: "0.2.0",
  };

  try {
    // Verificar conexão à base de dados
    const supabase = await createClient();

    // Test simple query
    const { error: dbError } = await supabase.from("audit_logs" as any).select("count").limit(1);

    if (dbError) {
      health.services.database = "error";
      health.status = "degraded";
    }

    // Verificar auth session (simples)
    const { error: authError } = await supabase.auth.getUser();
    // getUser pode retornar erro se não houver sessão, o que é esperado
    // Apenas marcamos como erro se for uma falha de conexão real
    if (authError && authError.status !== 401) {
      health.services.auth = "error";
      health.status = "degraded";
    }
  } catch (error) {
    console.error("Health check error:", error);
    health.status = "unhealthy";
    health.services.database = "error";
    health.services.auth = "error";
  }

  const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 503 : 500;

  return NextResponse.json(health, { status: statusCode });
}

/**
 * Health check endpoint for monitoring
 *
 * Usage:
 * curl https://fiaes.pt/api/health
 *
 * Response:
 * {
 *   "status": "healthy",
 *   "timestamp": "2026-11-19T10:30:00.000Z",
 *   "services": {
 *     "database": "ok",
 *     "auth": "ok"
 *   },
 *   "version": "0.2.0"
 * }
 *
 * Status codes:
 * - 200: Healthy
 * - 503: Degraded (some services down)
 * - 500: Unhealthy (critical failure)
 */
