import { createClient } from "@/lib/supabase/server";

export type AuditAction =
  | "login"
  | "logout"
  | "password_change"
  | "user_create"
  | "user_update"
  | "user_delete"
  | "torneio_create"
  | "torneio_update"
  | "torneio_delete"
  | "jogo_create"
  | "jogo_update"
  | "jogo_delete"
  | "resultado_registado"
  | "admin_access"
  | "data_export"
  | "gdpr_request";

export interface AuditLogEntry {
  user_id?: string;
  action: AuditAction;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  status: "success" | "failure";
  error_message?: string;
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("audit_logs").insert({
      user_id: entry.user_id,
      action: entry.action,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id,
      details: entry.details,
      ip_address: entry.ip_address,
      user_agent: entry.user_agent,
      status: entry.status,
      error_message: entry.error_message,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Erro ao registar evento de auditoria:", error);
    }
  } catch (err) {
    console.error("Erro inesperado ao registar auditoria:", err);
  }
}

export async function getAuditLogs(options?: { user_id?: string; action?: AuditAction; limit?: number; offset?: number }) {
  const supabase = await createClient();

  let query = supabase.from("audit_logs").select("*");

  if (options?.user_id) {
    query = query.eq("user_id", options.user_id);
  }

  if (options?.action) {
    query = query.eq("action", options.action);
  }

  // Manter últimos 90 dias
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  query = query.gte("created_at", ninetyDaysAgo.toISOString());

  query = query.order("created_at", { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, (options.offset || 0) + (options.limit || 50) - 1);
  }

  return query;
}
