"use client";

import { useState } from "react";
import type { Escalao } from "@/lib/supabase/database.types";

interface LinhaClassificacao {
  posicao: number;
  equipa: string;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golos_marcados: number;
  golos_sofridos: number;
  pontos: number;
}

export function FormClassificacao({ escaloes }: { escaloes: Escalao[] }) {
  const [escalaoId, setEscalaoId] = useState(escaloes[0]?.id || "");
  const [linhas, setLinhas] = useState<LinhaClassificacao[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const adicionarLinha = () => {
    setLinhas([
      ...linhas,
      {
        posicao: linhas.length + 1,
        equipa: "",
        jogos: 0,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        golos_marcados: 0,
        golos_sofridos: 0,
        pontos: 0,
      },
    ]);
  };

  const removerLinha = (index: number) => {
    setLinhas(linhas.filter((_, i) => i !== index));
  };

  const atualizarLinha = (index: number, campo: keyof LinhaClassificacao, valor: any) => {
    const novasLinhas = [...linhas];
    novasLinhas[index] = { ...novasLinhas[index], [campo]: valor };
    setLinhas(novasLinhas);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (linhas.length === 0 || !linhas[0].equipa) {
      setMensagem("Adicione pelo menos uma equipa");
      return;
    }

    setCarregando(true);
    setMensagem("");

    try {
      const response = await fetch("/api/admin/manual/classificacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          escalaoId,
          linhas: linhas.map(l => ({
            posicao: l.posicao,
            equipa: l.equipa,
            jogos: l.jogos,
            vitorias: l.vitorias,
            empates: l.empates,
            derrotas: l.derrotas,
            golos_marcados: l.golos_marcados,
            golos_sofridos: l.golos_sofridos,
            pontos: l.pontos,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error((await response.json()).message || "Erro ao salvar");
      }

      setMensagem(`✓ Classificação salva com ${linhas.length} equipas!`);
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      setMensagem(`✗ ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-borda bg-superficie p-6">
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Escalão</label>
          <select
            value={escalaoId}
            onChange={(e) => setEscalaoId(e.target.value)}
            className="w-full rounded-lg border border-borda bg-superficie px-3 py-2"
          >
            {escaloes.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-borda bg-fundo">
                <th className="px-2 py-2 text-left">#</th>
                <th className="px-2 py-2 text-left">Equipa</th>
                <th className="px-2 py-2 text-center">J</th>
                <th className="px-2 py-2 text-center">V</th>
                <th className="px-2 py-2 text-center">E</th>
                <th className="px-2 py-2 text-center">D</th>
                <th className="px-2 py-2 text-center">GM</th>
                <th className="px-2 py-2 text-center">GS</th>
                <th className="px-2 py-2 text-center">Pts</th>
                <th className="px-2 py-2 text-center">×</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((linha, idx) => (
                <tr key={idx} className="border-b border-borda">
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={linha.posicao}
                      onChange={(e) => atualizarLinha(idx, "posicao", parseInt(e.target.value))}
                      className="w-12 rounded border border-borda px-1 py-1 text-center"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={linha.equipa}
                      onChange={(e) => atualizarLinha(idx, "equipa", e.target.value)}
                      placeholder="Nome da equipa"
                      className="w-24 rounded border border-borda px-2 py-1"
                    />
                  </td>
                  {(["jogos", "vitorias", "empates", "derrotas", "golos_marcados", "golos_sofridos", "pontos"] as const).map(
                    (campo) => (
                      <td key={campo} className="px-2 py-2">
                        <input
                          type="number"
                          value={linha[campo]}
                          onChange={(e) => atualizarLinha(idx, campo, parseInt(e.target.value))}
                          className="w-12 rounded border border-borda px-1 py-1 text-center"
                          min="0"
                        />
                      </td>
                    )
                  )}
                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removerLinha(idx)}
                      className="text-derrota hover:font-bold"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {mensagem && (
          <div
            className={`rounded-lg px-4 py-2 text-sm font-semibold mb-4 ${
              mensagem.startsWith("✓") ? "bg-vitoria/10 text-vitoria" : "bg-derrota/10 text-derrota"
            }`}
          >
            {mensagem}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={adicionarLinhas}
            className="flex-1 rounded-lg border border-borda px-4 py-2 font-semibold hover:bg-borda"
          >
            + Nova Linha
          </button>
          <button
            type="submit"
            disabled={carregando}
            className="flex-1 rounded-lg bg-clube px-4 py-2 font-semibold text-clube-texto hover:opacity-90 disabled:opacity-50"
          >
            {carregando ? "Salvando..." : "✓ Salvar Classificação"}
          </button>
        </div>
      </div>
    </form>
  );

  function adicionarLinhas() {
    adicionarLinha();
  }
}
