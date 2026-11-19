"use client";

import { createClient } from "@/lib/supabase/client";
import type { OAuthProvider } from "@/lib/oauth";
import { OAUTH_PROVIDERS } from "@/lib/oauth";
import { useState } from "react";

export function BotoesOAuth({ redirectUrl }: { redirectUrl?: string }) {
  const [loading, setLoading] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState("");

  const handleOAuthSignIn = async (provider: OAuthProvider) => {
    setLoading(provider);
    setError("");

    try {
      const supabase = createClient();
      const baseUrl = redirectUrl || typeof window !== "undefined" ? window.location.origin : "";

      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${baseUrl}/auth/callback`,
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(null);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError("Erro ao conectar com OAuth. Tenta novamente.");
      console.error(err);
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-suave/20" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-site px-2 text-suave">OU</span>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(OAUTH_PROVIDERS).map(([key, provider]) => (
          <button
            key={key}
            onClick={() => handleOAuthSignIn(key as OAuthProvider)}
            disabled={loading !== null}
            className={`w-full rounded-lg px-4 py-2 font-semibold transition ${
              provider.color
            } ${loading === key ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span className="mr-2">{provider.icon}</span>
            {loading === key ? "A conectar..." : `Entrar com ${provider.name}`}
          </button>
        ))}
      </div>

      <p className="text-xs text-suave text-center">
        Ao entrar, aceitas os nossos{" "}
        <a href="/termos" className="underline hover:text-branco">
          Termos
        </a>{" "}
        e{" "}
        <a href="/privacidade" className="underline hover:text-branco">
          Privacidade
        </a>
      </p>
    </div>
  );
}
