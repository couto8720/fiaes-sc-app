import { type NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { destinoSeguro } from "@/lib/validacao";

// Destino dos links dos emails de convite e de recuperação da palavra-passe.
// Os modelos de email no Supabase têm de apontar para aqui (ver README → "Emails").
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const seguinte = destinoSeguro(searchParams.get("next"));

  const supabase = await createClient();
  const { error } = tokenHash && type
    ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    : code
      ? await supabase.auth.exchangeCodeForSession(code)
      : { error: new Error("Link incompleto") };

  const destino = request.nextUrl.clone();
  destino.search = "";
  if (error) {
    destino.pathname = "/admin/login";
    destino.searchParams.set("erro", "link");
  } else {
    destino.pathname = seguinte;
  }
  return NextResponse.redirect(destino);
}
