"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Fase {
  id: string;
  nome: string;
  numero_grupo?: number;
}

interface Equipa {
  id: string;
  nome: string;
  fase_torneio_id: string;
  fase_torneio?: { id: string; nome: string } | null;
}

interface Jogo {
  id: string;
  equipa_1_id: string;
  equipa_2_id: string;
  gols_equipa_1: number | null;
  gols_equipa_2: number | null;
  realizado: boolean;
}

interface Regra {
  id: string;
  nome: string;
  descricao?: string;
  tipo: string;
  criterio: string;
  num_equipas: number;
  posicoes: number[];
  ordem: number;
}

interface Apuramento {
  id: string;
  equipa_id: string;
  regra_id: string;
  regra?: { nome: string };
  equipa?: { nome: string };
}

interface VisualizadorQualificacaoProps {
  torneioId: string;
  torneio: any;
  fases: Fase[];
  equipas: Equipa[];
  jogos: Jogo[];
  regras: Regra[];
  apuramentos: Apuramento[];
}

export function VisualizadorQualificacao({
  torneioId,
  torneio,
  fases,
  equipas,
  jogos,
  regras,
  apuramentos,
}: VisualizadorQualificacaoProps) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function aplicarQualificacao() {
    setCarregando(true);
    setErro("");

    try {
      const res = await fetch(`/api/torneios/${torneioId}/qualificacao/aplicar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao aplicar qualificação");
      }

      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setCarregando(false);
    }
  }

  async function gerarJogosEliminatoria() {
    setCarregando(true);
    setErro("");

    try {
      const res = await fetch(`/api/torneios/${torneioId}/jogos/gerar-eliminatoria`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao gerar jogos");
      }

      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setCarregando(false);
    }
  }

  // Agrupar equipas por fase e calcular classificação
  const equipasPorFase = fases.map((fase) => {
    const equipasDaFase = equipas.filter((e) => e.fase_torneio_id === fase.id);

    // Calcular pontos e estatísticas para cada equipa
    const classificacao = equipasDaFase.map((equipa) => {
      const jogosEquipa = jogos.filter(
        (j) => (j.equipa_1_id === equipa.id || j.equipa_2_id === equipa.id) && j.realizado
      );

      let pontos = 0;
      let gm = 0;
      let gs = 0;

      jogosEquipa.forEach((jogo) => {
        const eh1 = jogo.equipa_1_id === equipa.id;
        const golsF = eh1 ? jogo.gols_equipa_1 : jogo.gols_equipa_2;
        const golsC = eh1 ? jogo.gols_equipa_2 : jogo.gols_equipa_1;

        gm += golsF ?? 0;
        gs += golsC ?? 0;

        if (!golsF || golsC === null) return;
        if (golsF > golsC) pontos += 3;
        else if (golsF === golsC) pontos += 1;
      });

      return {
        equipa,
        pontos,
        gm,
        gs,
        dg: gm - gs,
        jogos: jogosEquipa.length,
      };
    });

    // Ordenar por pontos, diferença de golos, golos marcados
    classificacao.sort((a, b) => {
      if (b.pontos !== a.pontos) return b.pontos - a.pontos;
      if (b.dg !== a.dg) return b.dg - a.dg;
      return b.gm - a.gm;
    });

    return { fase, classificacao };
  });

  return (
    <div className="space-y-6">
      {erro && (
        <p className="rounded-xl bg-derrota/10 px-4 py-3 text-sm font-medium text-derrota">
          ❌ {erro}
        </p>
      )}

      {/* Classificações */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">📊 Classificações</h2>
        {equipasPorFase.map(({ fase, classificacao }) => (
          <div key={fase.id} className="rounded-2xl border border-borda bg-superficie p-6">
            <h3 className="mb-4 text-xl font-bold">{fase.nome}</h3>
            {classificacao.length > 0 ? (
              <div className="space-y-2">
                {classificacao.map((item, idx) => (
                  <div
                    key={item.equipa.id}
                    className="flex items-center justify-between rounded-lg bg-fundo p-3"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-suave">{idx + 1}º</span>
                      <span className="font-medium">{item.equipa.nome}</span>
                    </div>
                    <div className="flex gap-6 text-sm text-suave">
                      <span>🏆 {item.pontos}pts</span>
                      <span>⚽ {item.gm}:{item.gs}</span>
                      <span>+{item.dg}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-suave">Sem equipas neste grupo</p>
            )}
          </div>
        ))}
      </div>

      {/* Regras de Qualificação */}
      {regras.length > 0 && (
        <div className="rounded-2xl border border-borda bg-superficie p-6">
          <h2 className="mb-4 text-2xl font-bold">📋 Regras de Qualificação</h2>
          <div className="space-y-3">
            {regras.map((regra) => (
              <div key={regra.id} className="rounded-lg border border-borda/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{regra.nome}</p>
                    {regra.descricao && <p className="text-sm text-suave">{regra.descricao}</p>}
                  </div>
                  <span className="text-sm font-medium text-clube">{regra.num_equipas} equipas</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apuramentos */}
      {apuramentos.length > 0 && (
        <div className="rounded-2xl border border-borda bg-superficie p-6">
          <h2 className="mb-4 text-2xl font-bold">✅ Equipas Apuradas</h2>
          <div className="space-y-2">
            {apuramentos.map((apuramento) => (
              <div
                key={apuramento.id}
                className="flex items-center justify-between rounded-lg bg-fundo p-3"
              >
                <span className="font-medium">{apuramento.equipa?.nome}</span>
                <span className="text-sm text-suave">{apuramento.regra?.nome}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botões */}
      <div className="space-y-3">
        <button
          onClick={aplicarQualificacao}
          disabled={carregando || regras.length === 0}
          className="w-full rounded-xl bg-clube px-6 py-4 font-semibold text-clube-texto transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {carregando ? "Aplicando..." : "✨ Aplicar Regras de Qualificação"}
        </button>

        {apuramentos.length > 0 && (
          <button
            onClick={gerarJogosEliminatoria}
            disabled={carregando}
            className="w-full rounded-xl bg-vitoria px-6 py-4 font-semibold text-vitoria-texto transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {carregando ? "Gerando..." : "🎮 Gerar Jogos de Eliminação"}
          </button>
        )}
      </div>
    </div>
  );
}
