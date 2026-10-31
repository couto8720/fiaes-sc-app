"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "./supabase/client";
import type { Jogo } from "./supabase/database.types";
import { esperaNovaTentativa, iguais, type ValoresMarcador } from "./marcador";

export type EstadoGravacao = "guardado" | "a-gravar" | "sem-rede" | "sem-permissao";

/**
 * Estado do marcador com gravação otimista:
 * - cada alteração aparece logo no ecrã e é gravada em segundo plano;
 * - grava sempre o valor completo (estado + golos), por isso repetir um envio é seguro;
 * - só há um pedido de cada vez; se mudar entretanto, envia o mais recente a seguir;
 * - sem rede: tenta outra vez (1 s, 2 s, 4 s … 30 s) e logo que o browser volte a ter ligação;
 * - alterações de outro dispositivo (outro delegado) chegam em tempo real quando não há nada pendente.
 */
export function useGravacaoMarcador(jogo: Jogo) {
  const [valores, setValores] = useState<ValoresMarcador>({
    estado: jogo.estado,
    golos_clube: jogo.golos_clube,
    golos_adversario: jogo.golos_adversario,
  });
  const [estadoDesde, setEstadoDesde] = useState(jogo.estado_desde);
  const [gravacao, setGravacao] = useState<EstadoGravacao>("guardado");

  const supabase = useRef<ReturnType<typeof createClient> | null>(null);
  const pendente = useRef<ValoresMarcador | null>(null);
  const emVoo = useRef(false);
  const tentativa = useRef(0);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const montado = useRef(true);
  const valoresAtuais = useRef<ValoresMarcador>({
    estado: jogo.estado,
    golos_clube: jogo.golos_clube,
    golos_adversario: jogo.golos_adversario,
  });
  /** Carimbo da última versão conhecida; ecos em tempo real mais antigos são ignorados. */
  const ultimaVersao = useRef(Date.parse(jogo.atualizado_em));

  const cliente = () => (supabase.current ??= createClient());

  const enviar = useCallback(async function enviarAgora(): Promise<void> {
    clearTimeout(temporizador.current);
    const alvo = pendente.current;
    if (emVoo.current || !alvo || !montado.current) return;
    emVoo.current = true;
    // Durante as novas tentativas mantém-se o aviso "sem rede" (não pisca para "a gravar").
    setGravacao(tentativa.current > 0 ? "sem-rede" : "a-gravar");

    let resposta: { data: Pick<Jogo, "estado_desde" | "atualizado_em"> | null; error: { code?: string } | null };
    try {
      resposta = await cliente()
        .from("jogos")
        .update(alvo)
        .eq("id", jogo.id)
        .select("estado_desde, atualizado_em")
        .abortSignal(AbortSignal.timeout(8000)) // rede "pendurada" no campo: desiste e volta a tentar
        .maybeSingle();
    } catch {
      resposta = { data: null, error: { code: "rede" } };
    }
    emVoo.current = false;
    if (!montado.current) return;

    const { data, error } = resposta;
    if (!error && !data) {
      // Nenhuma linha alterada: o RLS recusou (escalão retirado, perfil desativado…).
      pendente.current = null;
      setGravacao("sem-permissao");
      return;
    }
    if (error) {
      if (error.code === "42501") {
        pendente.current = null;
        setGravacao("sem-permissao");
        return;
      }
      setGravacao("sem-rede");
      temporizador.current = setTimeout(enviarAgora, esperaNovaTentativa(tentativa.current++));
      return;
    }

    tentativa.current = 0;
    if (data) {
      setEstadoDesde(data.estado_desde);
      ultimaVersao.current = Math.max(ultimaVersao.current, Date.parse(data.atualizado_em));
    }
    if (pendente.current === alvo) {
      pendente.current = null;
      setGravacao("guardado");
    } else {
      void enviarAgora(); // houve outro toque enquanto gravava
    }
  }, [jogo.id]);

  const alterar = useCallback(
    (novo: ValoresMarcador | null) => {
      if (!novo) return;
      // O tempo do novo estado (ex.: "2.ª parte · agora") conta logo, sem esperar pelo servidor.
      if (novo.estado !== valoresAtuais.current.estado) setEstadoDesde(new Date().toISOString());
      valoresAtuais.current = novo;
      setValores(novo);
      pendente.current = novo;
      void enviar();
    },
    [enviar],
  );

  // Rede de volta → tenta já. Aviso ao sair da página com alterações por gravar.
  useEffect(() => {
    montado.current = true;
    const online = () => {
      tentativa.current = 0;
      void enviar();
    };
    const antesDeSair = (e: BeforeUnloadEvent) => {
      if (pendente.current) e.preventDefault();
    };
    window.addEventListener("online", online);
    window.addEventListener("beforeunload", antesDeSair);
    return () => {
      montado.current = false;
      clearTimeout(temporizador.current);
      window.removeEventListener("online", online);
      window.removeEventListener("beforeunload", antesDeSair);
    };
  }, [enviar]);

  // Alterações feitas noutro dispositivo.
  useEffect(() => {
    const sb = cliente();
    const canal = sb
      .channel(`marcador-${jogo.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "jogos", filter: `id=eq.${jogo.id}` },
        (p) => {
          const r = p.new as Jogo;
          if (pendente.current || emVoo.current) return; // as alterações locais têm prioridade
          const versao = Date.parse(r.atualizado_em);
          if (versao <= ultimaVersao.current) return; // eco de uma gravação já conhecida (ou mais antiga)
          ultimaVersao.current = versao;
          const remoto = { estado: r.estado, golos_clube: r.golos_clube, golos_adversario: r.golos_adversario };
          valoresAtuais.current = remoto;
          setValores((atual) => (iguais(atual, remoto) ? atual : remoto));
          setEstadoDesde(r.estado_desde);
        },
      )
      .subscribe();
    return () => {
      sb.removeChannel(canal);
    };
  }, [jogo.id]);

  return { valores, estadoDesde, gravacao, alterar, tentarJa: enviar };
}

/** Mantém o ecrã do telemóvel ligado enquanto o marcador está aberto (onde o browser o permite). */
export function useEcraLigado() {
  useEffect(() => {
    let bloqueio: WakeLockSentinel | null = null;
    const pedir = async () => {
      try {
        if (document.visibilityState === "visible" && "wakeLock" in navigator) {
          bloqueio = await navigator.wakeLock.request("screen");
        }
      } catch {
        // Bateria fraca ou browser sem suporte: não faz mal.
      }
    };
    void pedir();
    document.addEventListener("visibilitychange", pedir);
    return () => {
      document.removeEventListener("visibilitychange", pedir);
      void bloqueio?.release().catch(() => {});
    };
  }, []);
}
