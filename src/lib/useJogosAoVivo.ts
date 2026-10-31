"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "./supabase/client";
import { supabaseConfigurado } from "./supabase/env";
import type { Jogo } from "./supabase/database.types";

/**
 * Recebe os jogos lidos no servidor e mantém-nos atualizados em tempo real:
 * - UPDATE (marcador, estado): aplicado logo na lista;
 * - INSERT/DELETE: pede ao servidor a página de novo (router.refresh);
 * - ao voltar ao separador ou reconectar: também atualiza, para não ficar um marcador antigo
 *   depois de o telemóvel estar bloqueado.
 */
export function useJogosAoVivo<T extends Jogo>(iniciais: T[]): T[] {
  const router = useRouter();
  const idCanal = useId();
  const [alteracoes, setAlteracoes] = useState<Record<string, Jogo>>({});

  useEffect(() => {
    if (!supabaseConfigurado) return;
    const supabase = createClient();
    let ligadoAntes = false;

    const canal = supabase
      .channel(`jogos${idCanal}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "jogos" }, (p) => {
        if (p.eventType === "UPDATE") {
          const novo = p.new as Jogo;
          setAlteracoes((a) => ({ ...a, [novo.id]: novo }));
        } else {
          router.refresh();
        }
      })
      // Marcador novo, corrigido ou apagado: volta a pedir a página (traz os golos já com os nomes).
      .on("postgres_changes", { event: "*", schema: "public", table: "golos" }, () => router.refresh())
      .subscribe((estado) => {
        if (estado === "SUBSCRIBED") {
          if (ligadoAntes) router.refresh(); // reconectou: pode ter perdido alterações
          ligadoAntes = true;
        }
      });

    const aoVoltar = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", aoVoltar);

    return () => {
      document.removeEventListener("visibilitychange", aoVoltar);
      supabase.removeChannel(canal);
    };
  }, [router, idCanal]);

  // Usa a versão mais recente de cada jogo (a do servidor ou a que chegou em tempo real).
  // Os campos das relações (escalão, local) vêm sempre do servidor.
  return useMemo(
    () =>
      iniciais.map((j) => {
        const a = alteracoes[j.id];
        return a && Date.parse(a.atualizado_em) > Date.parse(j.atualizado_em) ? { ...j, ...a } : j;
      }),
    [iniciais, alteracoes],
  );
}
