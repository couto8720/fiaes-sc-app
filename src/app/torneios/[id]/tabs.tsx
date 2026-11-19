"use client";

import { useState } from "react";
import { Info, Zap, Trophy } from "lucide-react";

export function TabsTorneioCliente({
  torneio,
  equipas,
  jogos,
  standings,
  equipasMap,
  formatoTexto,
}: {
  torneio: any;
  equipas: any[];
  jogos: any[];
  standings: any[];
  equipasMap: Map<string, string>;
  formatoTexto: Record<string, string>;
}) {
  const [activeTab, setActiveTab] = useState("info");

  const jogosFases = {
    grupos: jogos.filter((j) => j.fase?.includes("grupo") || !j.fase),
    eliminatoria: jogos.filter((j) => j.fase?.includes("elimin") || j.fase?.includes("semi") || j.fase?.includes("final")),
  };

  const tabs = [
    { id: "info", label: "Informações", icon: Info, count: null },
    { id: "classificacao", label: "Classificação", icon: Zap, count: null },
    { id: "jogos", label: "Jogos", icon: Info, count: jogosFases.grupos.length },
    { id: "eliminatoria", label: "Eliminatórias", icon: Trophy, count: jogosFases.eliminatoria.length },
  ];

  return (
    <>
      <div className="flex gap-1 border-b border-borda overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-clube text-clube"
                : "border-transparent text-suave hover:text-corpo"
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
            {tab.count !== null && <span className="ml-1 rounded-full bg-borda px-2 py-0.5 text-xs">{tab.count}</span>}
          </button>
        ))}
      </div>

      <div className="pt-4">
        {activeTab === "info" && (
          <div className="rounded-lg border border-borda bg-superficie p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-suave mb-3">Formato do Torneio</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-suave">Tipo:</span>
                  <span className="font-semibold">{formatoTexto[torneio.formato as keyof typeof formatoTexto]}</span>
                </div>
                {torneio.num_grupos && (
                  <div className="flex justify-between">
                    <span className="text-sm text-suave">Grupos:</span>
                    <span className="font-semibold">{torneio.num_grupos}</span>
                  </div>
                )}
                {torneio.equipas_por_grupo && (
                  <div className="flex justify-between">
                    <span className="text-sm text-suave">Equipas por grupo:</span>
                    <span className="font-semibold">{torneio.equipas_por_grupo}</span>
                  </div>
                )}
                {torneio.avancar_por_grupo && (
                  <div className="flex justify-between">
                    <span className="text-sm text-suave">Avançam por grupo:</span>
                    <span className="font-semibold">{torneio.avancar_por_grupo}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "classificacao" && (
          <div className="space-y-4">
            {Array.from(new Set(equipas.map((e) => {
              const match = e.nome?.match(/[A-D]/);
              return match ? match[0] : "A";
            }))).sort().map((grupo) => {
              const equipasDoGrupo = equipas.filter((e) => {
                const match = e.nome?.match(/[A-D]/);
                return (match ? match[0] : "A") === grupo;
              });

              // Calcular estatísticas baseado nos jogos
              const stats = new Map<string, { jogos: number; vitorias: number; empates: number; derrotas: number; pontos: number; }>();

              equipasDoGrupo.forEach((equipa) => {
                stats.set(equipa.id, { jogos: 0, vitorias: 0, empates: 0, derrotas: 0, pontos: 0 });
              });

              jogosFases.grupos.forEach((jogo) => {
                const nome1 = equipasMap.get(jogo.equipa_1_id) || "";
                const nome2 = equipasMap.get(jogo.equipa_2_id) || "";
                const match1 = nome1.match(/[A-D]/);
                const match2 = nome2.match(/[A-D]/);
                const grupoJogo1 = match1 ? match1[0] : "A";
                const grupoJogo2 = match2 ? match2[0] : "A";

                if (grupoJogo1 === grupo && grupoJogo2 === grupo) {
                  const temResultado = jogo.golos_equipa_1 !== null && jogo.golos_equipa_2 !== null;

                  if (stats.has(jogo.equipa_1_id)) {
                    const stat1 = stats.get(jogo.equipa_1_id)!;
                    stat1.jogos++;
                    if (temResultado) {
                      if (jogo.golos_equipa_1 > jogo.golos_equipa_2) {
                        stat1.vitorias++;
                        stat1.pontos += 3;
                      } else if (jogo.golos_equipa_1 === jogo.golos_equipa_2) {
                        stat1.empates++;
                        stat1.pontos += 1;
                      } else {
                        stat1.derrotas++;
                      }
                    }
                  }

                  if (stats.has(jogo.equipa_2_id)) {
                    const stat2 = stats.get(jogo.equipa_2_id)!;
                    stat2.jogos++;
                    if (temResultado) {
                      if (jogo.golos_equipa_2 > jogo.golos_equipa_1) {
                        stat2.vitorias++;
                        stat2.pontos += 3;
                      } else if (jogo.golos_equipa_2 === jogo.golos_equipa_1) {
                        stat2.empates++;
                        stat2.pontos += 1;
                      } else {
                        stat2.derrotas++;
                      }
                    }
                  }
                }
              });

              const equipasComStats = equipasDoGrupo
                .map((equipa) => ({
                  ...equipa,
                  ...stats.get(equipa.id)!,
                }))
                .sort((a, b) => {
                  if (b.pontos !== a.pontos) return b.pontos - a.pontos;
                  return (a.nome || "").localeCompare(b.nome || "");
                });

              return (
                <div key={grupo} className="space-y-3">
                  <h4 className="text-sm font-semibold text-suave">Grupo {grupo}</h4>
                  <div className="space-y-2">
                    {equipasComStats.map((equipa, idx) => (
                      <div key={equipa.id} className="rounded-lg border border-borda bg-superficie p-3 hover:bg-corpo/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-clube text-sm w-6">{idx + 1}º</span>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{equipa.nome}</p>
                            {equipa.e_clube && <p className="text-xs text-clube">Fiães SC</p>}
                          </div>
                          <div className="flex gap-3 text-xs text-suave">
                            <span>J: {equipa.jogos}</span>
                            <span className="text-vitoria">V: {equipa.vitorias}</span>
                            <span className="text-empate">E: {equipa.empates}</span>
                            <span className="text-derrota">D: {equipa.derrotas}</span>
                            <span className="font-bold text-clube">Pts: {equipa.pontos}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "jogos" && (
          <div className="space-y-6">
            {Array.from(new Set(jogosFases.grupos.map((j) => {
              const nome1 = equipasMap.get(j.equipa_1_id) || "";
              const nome2 = equipasMap.get(j.equipa_2_id) || "";
              const match1 = nome1.match(/[A-D]/);
              const match2 = nome2.match(/[A-D]/);
              const grupo1 = match1 ? match1[0] : "A";
              const grupo2 = match2 ? match2[0] : "A";
              return grupo1 === grupo2 ? grupo1 : "";
            }).filter(g => g !== ""))).sort().map((grupo) => {
              const jogosPorGrupo = jogosFases.grupos.filter((j) => {
                const nome1 = equipasMap.get(j.equipa_1_id) || "";
                const nome2 = equipasMap.get(j.equipa_2_id) || "";
                const match1 = nome1.match(/[A-D]/);
                const match2 = nome2.match(/[A-D]/);
                const grupo1 = match1 ? match1[0] : "A";
                const grupo2 = match2 ? match2[0] : "A";
                return grupo1 === grupo2 && grupo1 === grupo;
              });
              const jogosPorJornada = new Map<number, any[]>();

              jogosPorGrupo.forEach((jogo) => {
                const rodada = jogo.rodada || 1;
                if (!jogosPorJornada.has(rodada)) {
                  jogosPorJornada.set(rodada, []);
                }
                jogosPorJornada.get(rodada)!.push(jogo);
              });

              return (
                <div key={grupo} className="space-y-3">
                  <h4 className="text-sm font-semibold text-suave">Grupo {grupo}</h4>
                  {Array.from(jogosPorJornada.entries())
                    .sort(([rodadaA], [rodadaB]) => rodadaA - rodadaB)
                    .map(([rodada, jogos]) => (
                      <div key={`${grupo}-${rodada}`} className="space-y-2 pl-2 border-l-2 border-borda">
                        <p className="text-xs font-semibold text-suave">Rodada {rodada}</p>
                        {jogos.map((jogo) => {
                          const nome1 = equipasMap.get(jogo.equipa_1_id) || jogo.equipa_1 || "Equipa 1";
                          const nome2 = equipasMap.get(jogo.equipa_2_id) || jogo.equipa_2 || "Equipa 2";
                          const temResultado = jogo.golos_equipa_1 !== null && jogo.golos_equipa_2 !== null;

                          return (
                            <div key={jogo.id} className="rounded-lg border border-borda bg-superficie p-3 hover:bg-corpo/5 transition-colors">
                              <div className="flex items-center justify-between gap-3 mb-2">
                                <div className="flex-1 text-right">
                                  <p className="font-semibold text-sm">{nome1}</p>
                                </div>
                                <div className="flex flex-col items-center gap-1 px-3 py-1 bg-corpo/10 rounded min-w-16">
                                  {temResultado ? (
                                    <p className="text-lg font-bold text-clube">{jogo.golos_equipa_1} - {jogo.golos_equipa_2}</p>
                                  ) : (
                                    <p className="text-xs text-suave font-medium">vs</p>
                                  )}
                                </div>
                                <div className="flex-1 text-left">
                                  <p className="font-semibold text-sm">{nome2}</p>
                                </div>
                              </div>
                              {jogo.data_hora && (
                                <p className="text-xs text-suave text-center">
                                  {new Date(jogo.data_hora).toLocaleDateString("pt-PT", {
                                    weekday: "short",
                                    day: "2-digit",
                                    month: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "eliminatoria" && (
          <div className="space-y-3">
            {jogosFases.eliminatoria.length > 0 ? (
              <div className="space-y-3">
                {jogosFases.eliminatoria.map((jogo) => {
                  const nome1 = equipasMap.get(jogo.equipa_1_id) || jogo.equipa_1 || "Equipa 1";
                  const nome2 = equipasMap.get(jogo.equipa_2_id) || jogo.equipa_2 || "Equipa 2";
                  const temResultado = jogo.golos_equipa_1 !== null && jogo.golos_equipa_2 !== null;

                  const faseTexto: Record<string, string> = {
                    "semi": "Semifinal",
                    "final": "Final",
                    "eliminatoria": "Eliminatória",
                    "terceiro": "Terceiro Lugar",
                  };

                  const getFaseLabel = (fase?: string) => {
                    if (!fase) return "Eliminatória";
                    for (const [key, value] of Object.entries(faseTexto)) {
                      if (fase.toLowerCase().includes(key)) return value;
                    }
                    return fase;
                  };

                  return (
                    <div key={jogo.id} className="rounded-lg border border-borda bg-superficie p-4 hover:bg-corpo/5 transition-colors">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex-1 text-right">
                          <p className="font-semibold text-sm">{nome1}</p>
                        </div>
                        <div className="flex flex-col items-center gap-1 px-4 py-2 bg-corpo/10 rounded-lg min-w-20">
                          {temResultado ? (
                            <p className="text-lg font-bold text-clube">{jogo.golos_equipa_1} - {jogo.golos_equipa_2}</p>
                          ) : (
                            <p className="text-xs text-suave font-medium">vs</p>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-sm">{nome2}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-suave">
                        {jogo.data_hora && (
                          <span>
                            {new Date(jogo.data_hora).toLocaleDateString("pt-PT", {
                              weekday: "short",
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                        {jogo.fase && (
                          <span className="bg-clube/20 text-clube px-2 py-1 rounded font-semibold">
                            {getFaseLabel(jogo.fase)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-borda bg-superficie p-6 text-center text-suave">
                <p className="text-sm">Nenhuma eliminatória registada</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
