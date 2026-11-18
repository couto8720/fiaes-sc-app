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
  fase_torneio_id: string;
  fase_torneio?: { nome: string } | null;
}

interface Jogo {
  id: string;
  nome: string;
  equipa1_id: string;
  equipa2_id: string;
  golos_equipa1: number | null;
  golos_equipa2: number | null;
  criado_em: string;
  fase_torneio_id: string;
}

interface Fase {
  id: string;
  nome: string;
  ordem: number;
}

interface AbasTorneioProps {
  torneioId: string;
  equipas: Equipa[];
  jogos: Jogo[];
  fases: Fase[];
  mapEquipas: Record<string, string>;
}

export function AbasTorneio({ torneioId, equipas, jogos, fases, mapEquipas }: AbasTorneioProps) {
  const [abaAtiva, setAbaAtiva] = useState<"equipas" | "jogos" | "classificacao">("equipas");
  const [carregandoGerar, setCarregandoGerar] = useState(false);
  const [erroGerar, setErroGerar] = useState("");

  async function gerarJogosDaFase(faseId: string) {
    setCarregandoGerar(true);
    setErroGerar("");

    try {
      const res = await fetch(`/api/torneios/${torneioId}/gerar-jogos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fase_torneio_id: faseId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao gerar jogos");
      }

      const data = await res.json();
      alert(`✅ ${data.jogos_criados} jogos gerados com sucesso!`);
      window.location.reload();
    } catch (err) {
      setErroGerar(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setCarregandoGerar(false);
    }
  }

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
        <div className="space-y-6">
          {equipas && equipas.length > 0 ? (
            <>
              {fases && fases.length > 0 ? (
                <>
                  {fases.map((fase) => {
                    const equipasFase = equipas.filter((e) => e.fase_torneio_id === fase.id);
                    return (
                      <div key={fase.id} className="space-y-4">
                        <h3 className="text-lg font-bold">{fase.nome}</h3>
                        {equipasFase.length > 0 ? (
                          <div className="space-y-3">
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
                                  {equipasFase.map((equipa) => (
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
                            <button
                              onClick={() => gerarJogosDaFase(fase.id)}
                              disabled={carregandoGerar}
                              className="w-full rounded-lg bg-clube px-4 py-2 text-sm font-semibold text-clube-texto transition-opacity hover:opacity-80 disabled:opacity-50"
                            >
                              {carregandoGerar ? "Gerando..." : "⚽ Gerar Jogos Automáticos"}
                            </button>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-borda bg-superficie p-6 text-center">
                            <p className="text-suave text-sm">Nenhuma equipa neste grupo</p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {(() => {
                    const equipasSemFase = equipas.filter((e) => !e.fase_torneio_id);
                    if (equipasSemFase.length > 0) {
                      return (
                        <div className="space-y-4">
                          <h3 className="text-lg font-bold">Sem grupo atribuído</h3>
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
                                {equipasSemFase.map((equipa) => (
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
                        </div>
                      );
                    }
                  })()}
                </>
              ) : (
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
              )}
            </>
          ) : (
            <div className="rounded-xl border border-borda bg-superficie p-8 text-center">
              <p className="text-suave">Nenhuma equipa adicionada ainda</p>
            </div>
          )}
        </div>
      )}

      {abaAtiva === "jogos" && (
        <div className="space-y-6">
          {fases && fases.length > 0 ? (
            fases.map((fase) => {
              const jogosFase = jogos.filter((j) => j.fase_torneio_id === fase.id);
              return (
                <div key={fase.id} className="space-y-4">
                  <h3 className="text-lg font-bold">{fase.nome}</h3>
                  {jogosFase.length > 0 ? (
                    <div className="space-y-3">
                      {jogosFase.map((jogo) => (
                        <div key={jogo.id} className="rounded-xl border border-borda bg-superficie p-4">
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex-1 text-center sm:text-right">
                              <p className="font-semibold">{mapEquipas[jogo.equipa1_id] || "?"}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="font-bold text-lg min-w-12 text-center">
                                {jogo.golos_equipa1 ?? "—"}
                              </p>
                              <p className="font-semibold text-suave">vs</p>
                              <p className="font-bold text-lg min-w-12 text-center">
                                {jogo.golos_equipa2 ?? "—"}
                              </p>
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                              <p className="font-semibold">{mapEquipas[jogo.equipa2_id] || "?"}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-borda bg-superficie p-6 text-center">
                      <p className="text-suave text-sm">Nenhum jogo neste grupo</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-borda bg-superficie p-8 text-center">
              <p className="text-suave">Nenhum jogo registado ainda</p>
            </div>
          )}
        </div>
      )}

      {abaAtiva === "classificacao" && (
        <div className="space-y-6">
          {fases && fases.length > 0 ? (
            fases.map((fase) => {
              const equipasFase = equipas.filter((e) => e.fase_torneio_id === fase.id);
              return (
                <div key={fase.id} className="space-y-4">
                  <h3 className="text-lg font-bold">{fase.nome}</h3>
                  {equipasFase.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-borda">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-borda bg-fundo">
                            <th className="px-3 py-2 text-center font-semibold">Pos</th>
                            <th className="px-3 py-2 text-left font-semibold">Equipa</th>
                            <th className="px-3 py-2 text-center font-semibold">J</th>
                            <th className="px-3 py-2 text-center font-semibold">V</th>
                            <th className="px-3 py-2 text-center font-semibold">E</th>
                            <th className="px-3 py-2 text-center font-semibold">D</th>
                            <th className="px-3 py-2 text-center font-semibold">GF</th>
                            <th className="px-3 py-2 text-center font-semibold">GC</th>
                            <th className="px-3 py-2 text-center font-semibold">Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...equipasFase]
                            .sort((a, b) => {
                              if (b.pontos !== a.pontos) return b.pontos - a.pontos;
                              return (b.golos_marcados - b.golos_sofridos) - (a.golos_marcados - a.golos_sofridos);
                            })
                            .map((equipa, idx) => (
                              <tr key={equipa.id} className="border-b border-borda hover:bg-fundo/50">
                                <td className="px-3 py-2 text-center font-semibold">{idx + 1}</td>
                                <td className="px-3 py-2 font-semibold">{equipa.nome}</td>
                                <td className="px-3 py-2 text-center">{equipa.jogos || 0}</td>
                                <td className="px-3 py-2 text-center">{equipa.vitorias || 0}</td>
                                <td className="px-3 py-2 text-center">{equipa.empates || 0}</td>
                                <td className="px-3 py-2 text-center">{equipa.derrotas || 0}</td>
                                <td className="px-3 py-2 text-center">{equipa.golos_marcados || 0}</td>
                                <td className="px-3 py-2 text-center">{equipa.golos_sofridos || 0}</td>
                                <td className="px-3 py-2 text-center font-bold">{equipa.pontos || 0}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-borda bg-superficie p-6 text-center">
                      <p className="text-suave text-sm">Sem dados de classificação neste grupo</p>
                    </div>
                  )}
                </div>
              );
            })
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
