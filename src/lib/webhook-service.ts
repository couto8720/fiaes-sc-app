import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export type WebhookEvent =
  | "game.created"
  | "game.updated"
  | "game.result"
  | "tournament.created"
  | "tournament.updated"
  | "standings.updated";

interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: any;
}

/**
 * Trigger a webhook event - sends to all active webhooks listening to this event
 */
export async function triggerWebhook(event: WebhookEvent, data: any) {
  try {
    const supabase = await createClient();

    // Get active webhooks for this event
    const { data: webhooks, error } = await supabase
      .from("webhooks")
      .select("*")
      .eq("event_type", event)
      .eq("active", true);

    if (error) {
      console.error("Error fetching webhooks:", error);
      return;
    }

    if (!webhooks || webhooks.length === 0) {
      return;
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    // Send to each webhook asynchronously (non-blocking)
    for (const webhook of webhooks) {
      sendWebhook(webhook.id, webhook.url, webhook.secret || "", payload).catch(
        (err) => console.error(`Error sending webhook ${webhook.id}:`, err)
      );
    }
  } catch (error) {
    console.error("Error triggering webhook:", error);
  }
}

/**
 * Send webhook to a specific URL with signature
 */
async function sendWebhook(
  webhookId: string,
  url: string,
  secret: string,
  payload: WebhookPayload
) {
  const supabase = await createClient();

  try {
    const bodyString = JSON.stringify(payload);
    const signature = secret ? generateSignature(bodyString, secret) : "";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Event": payload.event,
      },
      body: bodyString,
      timeout: 10000, // 10 second timeout
    });

    const responseBody = await response.text();

    // Log the webhook delivery
    await supabase.from("webhook_logs").insert({
      webhook_id: webhookId,
      event_type: payload.event,
      event_data: payload.data,
      response_status: response.status,
      response_body: responseBody.substring(0, 1000), // Truncate
      success: response.ok,
    });

    if (!response.ok) {
      console.warn(`Webhook ${webhookId} returned status ${response.status}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Log the error
    await supabase.from("webhook_logs").insert({
      webhook_id: webhookId,
      event_type: payload.event,
      event_data: payload.data,
      error_message: errorMessage.substring(0, 1000),
      success: false,
    });

    console.error(`Failed to send webhook ${webhookId}:`, error);
  }
}

/**
 * Generate HMAC signature for webhook verification
 */
function generateSignature(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Verify webhook signature (for receiving webhooks)
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
