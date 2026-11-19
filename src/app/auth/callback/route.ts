import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback handler para OAuth e email confirmation
 * URL: /auth/callback?code=...&error=...
 *
 * Flow:
 * 1. User clicks OAuth link (Google, Microsoft) → Supabase auth page
 * 2. User approves → Supabase redirects to this callback with `code` parameter
 * 3. We handle the code and establish session
 * 4. Redirect to next URL or admin panel
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");
  const next = url.searchParams.get("next");

  // Check for auth errors
  if (error) {
    console.error("Auth callback error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(
        `/admin/login?erro=${encodeURIComponent(error)}&msg=${encodeURIComponent(errorDescription || "Erro de autenticação")}`,
        request.url
      )
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL("/admin/login?erro=missing_code", request.url));
  }

  try {
    const supabase = await createClient();

    // Exchange code for session (PKCE flow)
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError || !data.user) {
      console.error("Session exchange error:", sessionError);
      return NextResponse.redirect(
        new URL(
          `/admin/login?erro=session_failed&msg=${encodeURIComponent(sessionError?.message || "Erro ao estabelecer sessão")}`,
          request.url
        )
      );
    }

    // Successful authentication
    // On first OAuth login, Supabase auto-creates user in auth
    // Now we might need to create a profile in our profiles table if it doesn't exist

    const { data: profile } = await supabase
      .from("perfis")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    // If no profile exists for this OAuth user, they're a new user
    // Don't auto-create profile - let them go through registration or just access public areas
    // Admin can assign them staff roles later

    // Redirect to next URL or admin panel
    const redirectUrl = next ? decodeURIComponent(next) : "/admin";

    // Validate redirect URL to prevent open redirects
    if (!redirectUrl.startsWith("/")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error("Unexpected callback error:", error);
    return NextResponse.redirect(
      new URL("/admin/login?erro=unexpected&msg=Erro+inesperado", request.url)
    );
  }
}
