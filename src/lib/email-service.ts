import { getEmailTemplate } from "./email-templates";
import { createClient } from "@/lib/supabase/server";

/**
 * Serviço de envio de emails
 * Usa Supabase Auth built-in emails ou SendGrid
 */

interface EmailOptions {
  to: string;
  templateType: string;
  templateData: Record<string, any>;
  cc?: string[];
  bcc?: string[];
}

/**
 * Envia email usando Supabase Auth
 * Para emails de autenticação (password reset, confirmação, etc)
 */
export async function sendAuthEmail(email: string, type: "signup" | "reset" | "otp", emailData: Record<string, any>) {
  const supabase = await createClient();

  try {
    if (type === "reset") {
      // Reset password é enviado automaticamente pelo Supabase
      // Apenas logar que foi solicitado
      console.log(`Password reset requested for ${email}`);
      return { success: true, message: "Password reset email queued" };
    }

    return { success: true, message: `Auth email queued: ${type}` };
  } catch (error) {
    console.error("Erro ao enviar auth email:", error);
    throw error;
  }
}

/**
 * Envia email personalizado
 * Para notificações, alertas, etc
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const template = getEmailTemplate(options.templateType, options.templateData);

    // Opção 1: SendGrid (recomendado para produção)
    if (process.env.SENDGRID_API_KEY) {
      return await sendViasendGrid({
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    }

    // Opção 2: Supabase Functions (serverless)
    if (process.env.SUPABASE_FUNCTION_URL) {
      return await sendViaSupabaseFunction({
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    }

    // Fallback: apenas logar (desenvolvimento)
    console.log("Email queued (development mode):", {
      to: options.to,
      subject: template.subject,
    });

    return { success: true, message: "Email queued (dev mode)" };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Enviar via SendGrid
 */
async function sendViaendGrid(emailData: {
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  text: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: emailData.to }],
            ...(emailData.cc && { cc: emailData.cc.map((e) => ({ email: e })) }),
            ...(emailData.bcc && { bcc: emailData.bcc.map((e) => ({ email: e })) }),
          },
        ],
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || "noreply@fiaes.pt",
          name: "Fiães SC",
        },
        subject: emailData.subject,
        content: [
          {
            type: "text/plain",
            value: emailData.text,
          },
          {
            type: "text/html",
            value: emailData.html,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`SendGrid error: ${response.statusText}`);
    }

    return { success: true, messageId: response.headers.get("x-message-id") || undefined };
  } catch (error) {
    console.error("SendGrid error:", error);
    throw error;
  }
}

/**
 * Enviar via Supabase Edge Functions
 */
async function sendViaSupabaseFunction(emailData: {
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  text: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // Invocar Edge Function
    const response = await supabase.functions.invoke("send-email", {
      body: emailData,
    });

    if (response.error) {
      throw response.error;
    }

    return { success: true, messageId: response.data?.messageId };
  } catch (error) {
    console.error("Supabase function error:", error);
    throw error;
  }
}

/**
 * Tipos de email que podem ser enviados
 */
export const EMAIL_TYPES = {
  password_reset: "password_reset",
  two_fa_enabled: "2fa_enabled",
  login_alert: "login_alert",
  gdpr_data_export: "gdpr_data_export",
} as const;

/**
 * Helper para enviar emails comuns
 */
export async function sendNotificationEmail(type: string, email: string, data: Record<string, any>) {
  return sendEmail({
    to: email,
    templateType: type,
    templateData: { email, ...data },
  });
}
