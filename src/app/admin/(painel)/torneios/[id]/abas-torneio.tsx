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

interface Local {
  id: string;
  nome: string;
}

interface AbasTorneioProps {
  torneioId: string;
  equipas: Equipa[];
  jogos: Jogo[];
  fases: Fase[];
  mapEquipas: Record<string, string>;
  locais: Local[];
  mapLocais: Record<string, string>;
}

export function AbasTorneio({ torneioId, equipas, jogos, fases, mapEquipas, locais, mapLocais }: AbasTorneioProps) {
  const [abaAtiva, setAbaAtiva] = useState<"equipas" | "jogos" | "classificacao">("equipas");
  const [carregandoGerar, setCarregandoGerar] = useState(false);
  const [erroGerar, setErroGerar] = useState("");
  const [jogoEditando, setJogoEditando] = useState<string | null>(null);
  const [jogoValores, setJogoValores] = useState<Record<string, { golos1: string; golos2: string; dataHora: string; localId: string }>>({});

  // Mapeamento invertido: nome do local -> id
  const mapLocaisInvertido = Object.entries(mapLocais).reduce(
    (acc, [id, nome]) => ({ ...acc, [nome]: id }),
    {} as Record<string, string>
  );

  // Calcular pontos do confronto direto entre duas equipas
  function calcularPontosConfrontoDireto(equipaA: Equipa, equipaB: Equipa) {
    let pontosA = 0;
    let pontosB = 0;
    let golosAMarcados = 0;
    let golosasofridos = 0;
    let golosBMarcados = 0;
    let golosBsofridos = 0;

    // Encontrar todos os jogos entre as duas equipas
    jogos.forEach((jogo) => {
      const equipa1Final = jogo.equipa1_id || jogo.equipa_1_id;
      const equipa2Final = jogo.equipa2_id || jogo.equipa_2_id;

      if (!jogo.golos_equipa1 && jogo.golos_equipa1 !== 0) return; // Jogo não foi jogado
      if (!jogo.golos_equipa2 && jogo.golos_equipa2 !== 0) return; // Jogo não foi jogado

      // Se A jogou contra B
      if (equipa1Final === equipaA.id && equipa2Final === equipaB.id) {
        golosAMarcados += jogo.golos_equipa1;
        golosBsofridos += jogo.golos_equipa1;
        golosBMarcados += jogo.golos_equipa2;
        golosasofridos += jogo.golos_equipa2;

        if (jogo.golos_equipa1 > jogo.golos_equipa2) pontosA += 3;
        else if (jogo.golos_equipa1 < jogo.golos_equipa2) pontosB += 3;
        else {
          pontosA += 1;
          pontosB += 1;
        }
      }
      // Se B jogou contra A
      else if (equipa1Final === equipaB.id && equipa2Final === equipaA.id) {
        golosBMarcados += jogo.golos_equipa1;
        golosasofridos += jogo.golos_equipa1;
        golosAMarcados += jogo.golos_equipa2;
        golosBsofridos += jogo.golos_equipa2;

        if (jogo.golos_equipa1 > jogo.golos_equipa2) pontosB += 3;
        else if (jogo.golos_equipa1 < jogo.golos_equipa2) pontosA += 3;
        else {
          pontosB += 1;
          pontosA += 1;
        }
      }
    });

    // Retornar diferença: se A venceu no confronto direto, retorna número positivo
    if (pontosA !== pontosB) return pontosB - pontosA; // Diferença de pontos
    return (golosBMarcados - golosBsofridos) - (golosAMarcados - golosasofridos); // Diferença de golos
  }

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
      router.refresh();
    } catch (err) {
      setErroGerar(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setCarregandoGerar(false);
    }
  }

  async function salvarGolosJogo(jogoId: string) {
    const valores = jogoValores[jogoId];
    if (!valores) return;

    try {
      // Converter nome do local para ID
      const localId = valores.localId ? mapLocaisInvertido[valores.localId] : null;

      const res = await fetch(`/api/torneios/${torneioId}/jogos/${jogoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          golos_equipa_1: valores.golos1 ? parseInt(valores.golos1) : null,
          golos_equipa_2: valores.golos2 ? parseInt(valores.golos2) : null,
          data_hora: valores.dataHora || null,
          local_id: localId,
          estado: valores.golos1 || valores.golos2 ? "final" : "agendado",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar jogo");
      }

      alert("✅ Jogo atualizado com sucesso!");
      setJogoEditando(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro desconhecido");
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

              // Agrupar jogos por rodada
              const jogosPorRodada = new Map<number, typeof jogosFase>();
              jogosFase.forEach((jogo) => {
                const rodada = jogo.rodada || 0;
                if (!jogosPorRodada.has(rodada)) {
                  jogosPorRodada.set(rodada, []);
                }
                jogosPorRodada.get(rodada)!.push(jogo);
              });

              // Ordenar rodadas
              const rodasOrdenadas = Array.from(jogosPorRodada.keys()).sort((a, b) => a - b);

              return (
                <div key={fase.id} className="space-y-4">
                  <h3 className="text-lg font-bold">{fase.nome}</h3>
                  {jogosFase.length > 0 ? (
                    <div className="space-y-6">
                      {rodasOrdenadas.map((rodada) => (
                        <div key={`rodada-${rodada}`} className="space-y-2">
                          {rodada > 0 && (
                            <h4 className="text-sm font-semibold text-clube">🎯 Rodada {rodada}</h4>
                          )}
                          <div className="space-y-3">
                            {jogosPorRodada.get(rodada)!.map((jogo) => (
                        <div key={jogo.id} className="rounded-xl border border-borda bg-superficie p-4">
                          <div className="text-xs text-suave mb-2">
                            {jogo.data_hora && (
                              <span>📅 {new Date(jogo.data_hora).toLocaleString('pt-PT')}</span>
                            )}
                            {jogo.local_id && mapLocais[jogo.local_id] && (
                              <span className="ml-3">📍 {mapLocais[jogo.local_id]}</span>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex-1 text-center sm:text-right">
                              <p className="font-semibold">{mapEquipas[jogo.equipa_1_id] || "?"}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              {jogoEditando === jogo.id ? (
                                <>
                                  <input
                                    type="number"
                                    min="0"
                                    className="w-12 h-8 rounded border border-borda bg-fundo text-center"
                                    value={jogoValores[jogo.id]?.golos1 ?? jogo.golos_equipa_1 ?? ""}
                                    onChange={(e) => setJogoValores({
                                      ...jogoValores,
                                      [jogo.id]: { ...jogoValores[jogo.id], golos1: e.target.value }
                                    })}
                                  />
                                  <p className="font-semibold text-suave">vs</p>
                                  <input
                                    type="number"
                                    min="0"
                                    className="w-12 h-8 rounded border border-borda bg-fundo text-center"
                                    value={jogoValores[jogo.id]?.golos2 ?? jogo.golos_equipa_2 ?? ""}
                                    onChange={(e) => setJogoValores({
                                      ...jogoValores,
                                      [jogo.id]: { ...jogoValores[jogo.id], golos2: e.target.value }
                                    })}
                                  />
                                </>
                              ) : (
                                <>
                                  <p className="font-bold text-lg min-w-12 text-center">
                                    {jogo.golos_equipa_1 ?? "—"}
                                  </p>
                                  <p className="font-semibold text-suave">vs</p>
                                  <p className="font-bold text-lg min-w-12 text-center">
                                    {jogo.golos_equipa_2 ?? "—"}
                                  </p>
                                </>
                              )}
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                              <p className="font-semibold">{mapEquipas[jogo.equipa_2_id] || "?"}</p>
                            </div>
                          </div>
                          {jogoEditando === jogo.id && (
                            <div className="mt-3 space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-xs font-semibold text-suave">Data/Hora</label>
                                  <input
                                    type="datetime-local"
                                    className="w-full h-8 mt-1 rounded border border-borda bg-fundo px-2 text-sm"
                                    value={jogoValores[jogo.id]?.dataHora || (jogo.data_hora ? jogo.data_hora.slice(0, 16) : "")}
                                    onChange={(e) => {
                                      const valores = jogoValores[jogo.id] || { golos1: "", golos2: "", dataHora: "", localId: "" };
                                      setJogoValores({
                                        ...jogoValores,
                                        [jogo.id]: { ...valores, dataHora: e.target.value }
                                      });
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-suave">Local</label>
                                  <select
                                    className="w-full h-8 mt-1 rounded border border-borda bg-fundo px-2 text-sm"
                                    value={jogoValores[jogo.id]?.localId || (jogo.local_id && mapLocais[jogo.local_id] ? mapLocais[jogo.local_id] : "")}
                                    onChange={(e) => {
                                      const valores = jogoValores[jogo.id] || { golos1: "", golos2: "", dataHora: "", localId: "" };
                                      setJogoValores({
                                        ...jogoValores,
                                        [jogo.id]: { ...valores, localId: e.target.value }
                                      });
                                    }}
                                  >
                                    <option value="">Selecionar local...</option>
                                    {["Campo 1", "Campo 2", "Campo 3", "Campo 4", "Campo 5", "Campo 6"].map((campo) => (
                                      <option key={campo} value={campo}>{campo}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => salvarGolosJogo(jogo.id)}
                                  className="flex-1 rounded bg-vitoria px-3 py-2 text-sm font-semibold text-white hover:opacity-80"
                                >
                                  ✓ Guardar
                                </button>
                                <button
                                  onClick={() => setJogoEditando(null)}
                                  className="flex-1 rounded border border-borda px-3 py-2 text-sm font-semibold hover:opacity-80"
                                >
                                  ✕ Cancelar
                                </button>
                              </div>
                            </div>
                          )}
                          {jogoEditando !== jogo.id && (
                            <button
                              onClick={() => {
                                setJogoEditando(jogo.id);
                                setJogoValores({
                                  ...jogoValores,
                                  [jogo.id]: {
                                    golos1: (jogo.golos_equipa_1 ?? "").toString(),
                                    golos2: (jogo.golos_equipa_2 ?? "").toString(),
                                    dataHora: jogo.data_hora || "",
                                    localId: (jogo.local_id && mapLocais[jogo.local_id] ? mapLocais[jogo.local_id] : "")
                                  }
                                });
                              }}
                              className="mt-3 w-full rounded bg-clube/10 px-3 py-2 text-sm font-semibold text-clube hover:bg-clube/20"
                            >
                              ✏️ Editar Resultado
                            </button>
                          )}
                            </div>
                          ))}
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
          {/* Legenda dos Critérios de Desempate */}
          <div className="rounded-xl bg-clube/10 border border-clube/20 p-4">
            <h3 className="font-semibold text-clube mb-3">📋 Critérios de Desempate</h3>
            <div className="grid gap-2 text-sm text-suave">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-clube min-w-6">1º</span>
                <span><strong>Pontos</strong> - Vitória = 3 pts, Empate = 1 pt, Derrota = 0 pts</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-clube min-w-6">2º</span>
                <span><strong>Confronto Direto</strong> - Resultado do jogo entre as equipas empatadas</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-clube min-w-6">3º</span>
                <span><strong>Diferença de Golos</strong> - Golos marcados - Golos sofridos</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-clube min-w-6">4º</span>
                <span><strong>Golos Marcados</strong> - Número total de golos marcados</span>
              </div>
            </div>
          </div>

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
                              // 1º critério: Pontos
                              if (b.pontos !== a.pontos) return b.pontos - a.pontos;

                              // 2º critério: Confronto Direto
                              const pontosCD = calcularPontosConfrontoDireto(a, b);
                              if (pontosCD !== 0) return -pontosCD;

                              // 3º critério: Diferença de Golos
                              const difA = a.golos_marcados - a.golos_sofridos;
                              const difB = b.golos_marcados - b.golos_sofridos;
                              if (difB !== difA) return difB - difA;

                              // 4º critério: Golos Marcados
                              return b.golos_marcados - a.golos_marcados;
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
