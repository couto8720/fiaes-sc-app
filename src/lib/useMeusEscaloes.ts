"use client";

import { useEffect, useState } from "react";
import { createClient } from "./supabase/client";
import { supabaseConfigurado } from "./supabase/env";

/**
 * Escalões que o adepto com sessão segue ("Os meus escalões"), ou null se não houver
 * adepto com sessão. Atualiza quando a pessoa entra ou sai.
 */
export function useMeusEscaloes(): string[] | null {
  const [meus, setMeus] = useState<string[] | null>(null);

  useEffect(() => {
    if (!supabaseConfigurado) return;
    const supabase = createClient();
    let ativo = true;

    const carregar = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        if (ativo) setMeus(null);
        return;
      }
      const { data } = await supabase.from("adeptos").select("escaloes").eq("id", auth.user.id).maybeSingle();
      if (ativo) setMeus(data?.escaloes ?? null);
    };

    void carregar();
    const { data: sub } = supabase.auth.onAuthStateChange(() => void carregar());
    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return meus;
}
