"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * O email de convite padrão do Supabase devolve a sessão no fragmento do URL
 * (#access_token=…&refresh_token=…&type=invite), que o servidor não consegue ler.
 * Aqui, no browser, guarda-se essa sessão (cookies) e segue-se para definir a palavra-passe.
 */
export function AceitarConvite() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.hash.slice(1));
    // Limpa os tokens da barra de endereço (não ficam no histórico nem em capturas de ecrã).
    window.history.replaceState(null, "", window.location.pathname);

    const access_token = p.get("access_token");
    const refresh_token = p.get("refresh_token");

    (async () => {
      if (p.get("error") || !access_token || !refresh_token) {
        setErro(p.get("error_description") ?? "O link do convite é inválido ou expirou.");
        return;
      }
      const { error } = await createClient().auth.setSession({ access_token, refresh_token });
      if (error) setErro("O link do convite é inválido ou expirou.");
      else router.replace("/admin/definir-palavra-passe");
    })();
  }, [router]);

  if (!erro) return <p className="text-sm text-suave">A confirmar…</p>;
  return (
    <div className="space-y-3 text-sm">
      <p role="alert" className="font-medium text-derrota">{erro}</p>
      <p>Pede ao responsável do clube um convite novo.</p>
      <Link href="/admin/login" className="inline-block font-semibold underline">Ir para o login</Link>
    </div>
  );
}
