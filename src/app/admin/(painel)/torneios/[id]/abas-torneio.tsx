"use client";

import { useState } from "react";

interface Equipa {
  id: string;
  nome: string;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golos_marcados: number;
  golos_sofridos: number;
  pontos: number;
}

interface Jogo {
  id: string;
  nome: string;
  equipa1_id: string;
  equipa2_id: string;
  golos_equipa1: number | null;
  golos_equipa2: number | null;
  criado_em: string;
}

interface AbasTorneioProps {
  torneioId: string;
  equipas: Equipa[];
  jogos: Jogo[];
}

export function AbasTorneio({ torneioId, equipas, jogos }: AbasTorneioProps) {
  const [abaAtiva, setAbaAtiva] = useState<"equipas" | "jogos" | "classificacao">("equipas");

  return (
    <div className="space-y-6">
      {/* Abas */}
      <div className="border-b border-borda">
        <div className="flex gap-4">
          <button
            onClick={() => setAbaAtiva("equipas")}
            className={`px-4 py-3 font-semibold transition-colors ${
              abaAtiva === "equipas"
                ? "border-b-2 border-clube text-clube"
                : "text-suave hover:text-branco"
            }`}
          >
            Equipas
          </button>
          <button
            onClick={() => setAbaAtiva("jogos")}
            className={`px-4 py-3 font-semibold transition-colors ${
              abaAtiva === "jogos"
                ? "border-b-2 border-clube text-clube"
                : "text-suave hover:text-branco"
            }`}
          >
            Jogos
          </button>
          <button
            onClick={() => setAbaAtiva("classificacao")}
            className={`px-4 py-3 font-semibold transition-colors ${
              abaAtiva === "classificacao"
                ? "border-b-2 border-clube text-clube"
                : "text-suave hover:text-branco"
            }`}
          >
            Classificação
          </button>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      {abaAtiva === "equipas" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Equipas ({equipas?.length || 0})</h2>
          {equipas && equipas.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-borda">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-borda bg-fundo">
                    <th className="px-4 py-3 text-left text-sm font-semibold">Nome</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Jogos</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">V-E-D</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">GF/GC</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Pontos</th>
                  </tr>
                </thead>
                <tbody>
                  {equipas.map((equipa) => (
                    <tr key={equipa.id} className="border-b border-borda hover:bg-fundo/50">
                      <td className="px-4 py-3 font-semibold">{equipa.nome}</td>
                      <td className="px-4 py-3 text-center">{equipa.jogos || 0}</td>
                      <td className="px-4 py-3 text-center text-sm">
                        {equipa.vitorias || 0}-{equipa.empates || 0}-{equipa.derrotas || 0}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {equipa.golos_marcados || 0}/{equipa.golos_sofridos || 0}
                      </td>
                      <td className="px-4 py-3 text-center font-bold">{equipa.pontos || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-borda bg-superficie p-8 text-center">
              <p className="text-suave">Nenhuma equipa adicionada ainda</p>
            </div>
          )}
        </div>
      )}

      {abaAtiva === "jogos" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Jogos ({jogos?.length || 0})</h2>
          {jogos && jogos.length > 0 ? (
            <div className="space-y-3">
              {jogos.map((jogo) => (
                <div key={jogo.id} className="rounded-xl border border-borda bg-superficie p-4">
                  <p className="font-semibold text-sm text-suave mb-2">{jogo.nome}</p>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 text-center">
                      <p className="font-semibold text-lg">{jogo.golos_equipa1 ?? "—"}</p>
                    </div>
                    <p className="font-semibold text-suave">vs</p>
                    <div className="flex-1 text-center">
                      <p className="font-semibold text-lg">{jogo.golos_equipa2 ?? "—"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-borda bg-superficie p-8 text-center">
              <p className="text-suave">Nenhum jogo registado ainda</p>
            </div>
          )}
        </div>
      )}

      {abaAtiva === "classificacao" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Classificação</h2>
          {equipas && equipas.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-borda">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-borda bg-fundo">
                    <th className="px-4 py-3 text-center text-sm font-semibold">Posição</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Equipa</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">J</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">V</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">E</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">D</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">GF</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">GC</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {[...equipas]
                    .sort((a, b) => {
                      if (b.pontos !== a.pontos) return b.pontos - a.pontos;
                      return (b.golos_marcados - b.golos_sofridos) - (a.golos_marcados - a.golos_sofridos);
                    })
                    .map((equipa, idx) => (
                      <tr key={equipa.id} className="border-b border-borda hover:bg-fundo/50">
                        <td className="px-4 py-3 text-center font-semibold">{idx + 1}</td>
                        <td className="px-4 py-3 font-semibold">{equipa.nome}</td>
                        <td className="px-4 py-3 text-center">{equipa.jogos || 0}</td>
                        <td className="px-4 py-3 text-center">{equipa.vitorias || 0}</td>
                        <td className="px-4 py-3 text-center">{equipa.empates || 0}</td>
                        <td className="px-4 py-3 text-center">{equipa.derrotas || 0}</td>
                        <td className="px-4 py-3 text-center">{equipa.golos_marcados || 0}</td>
                        <td className="px-4 py-3 text-center">{equipa.golos_sofridos || 0}</td>
                        <td className="px-4 py-3 text-center font-bold">{equipa.pontos || 0}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-borda bg-superficie p-8 text-center">
              <p className="text-suave">Sem dados de classificação ainda</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
