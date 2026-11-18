"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Equipa {
  id: string;
  nome: string;
}

interface Jogo {
  id: string;
  equipa_1_id: string | null;
  equipa_2_id: string | null;
  golos_equipa_1: number | null;
  golos_equipa_2: number | null;
  realizado: boolean;
  tipo_jogo: string;
  rodada: number;
  equipa_1?: Equipa | null;
  equipa_2?: Equipa | null;
}

interface Apuramento {
  id: string;
  equipa_id: string;
  equipa?: { id: string; nome: string };
}

interface VisualizadorEliminatoriaProps {
  torneioId: string;
  jogos: Jogo[];
  apuramentos: Apuramento[];
  temTerceiroLugar: boolean;
}

export function VisualizadorEliminatoria({
  torneioId,
  jogos,
  apuramentos,
  temTerceiroLugar,
}: VisualizadorEliminatoriaProps) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [jogoEditando, setJogoEditando] = useState<string | null>(null);
  const [jogoValores, setJogoValores] = useState<Record<string, { g1: string; g2: string }>>({});

  // Separar jogos por rodada
  const semifinais = jogos.filter((j) => j.rodada === 1);
  const disputaTerceiro = jogos.find((j) => j.rodada === 2 && jogos.filter(x => x.rodada === 2).indexOf(j) === 0);
  const final = jogos.find((j) => j.rodada === 2 && jogos.filter(x => x.rodada === 2).indexOf(j) === 1);

  async function salvarResultado(jogoId: string) {
    const valores = jogoValores[jogoId];
    if (!valores) return;

    setCarregando(true);
    setErro("");

    try {
      const res = await fetch(`/api/torneios/${torneioId}/jogos/${jogoId}/resultado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          golos_equipa_1: parseInt(valores.g1),
          golos_equipa_2: parseInt(valores.g2),
          estado: "final",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar resultado");
      }

      setJogoEditando(null);
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setCarregando(false);
    }
  }

  function iniciarEdicao(jogo: Jogo) {
    setJogoEditando(jogo.id);
    setJogoValores({
      [jogo.id]: {
        g1: jogo.golos_equipa_1?.toString() || "",
        g2: jogo.golos_equipa_2?.toString() || "",
      },
    });
  }

  return (
    <div className="space-y-8">
      {erro && (
        <p className="rounded-xl bg-derrota/10 px-4 py-3 text-sm font-medium text-derrota">
          ❌ {erro}
        </p>
      )}

      {/* Equipas Apuradas */}
      <div className="rounded-2xl border border-borda bg-superficie p-6">
        <h2 className="mb-4 text-xl font-bold">✅ Equipas Apuradas</h2>
        <div className="flex flex-wrap gap-2">
          {apuramentos.map((apr) => (
            <div
              key={apr.equipa_id}
              className="rounded-lg bg-clube/10 px-3 py-2 text-sm font-medium text-clube"
            >
              {apr.equipa?.nome}
            </div>
          ))}
        </div>
      </div>

      {/* Bracket Visual */}
      <div className="space-y-8">
        {/* Semi-finais */}
        <div>
          <h3 className="mb-4 text-lg font-bold">🥈 Semi-finais</h3>
          <div className="space-y-3">
            {semifinais.map((jogo) => (
              <div
                key={jogo.id}
                className="rounded-2xl border border-borda bg-superficie p-6"
              >
                <div className="flex items-center gap-6">
                  {/* Equipa 1 */}
                  <div className="flex flex-1 items-center gap-3">
                    <div className="flex-1">
                      <p className="font-semibold">{jogo.equipa_1?.nome || "—"}</p>
                    </div>
                  </div>

                  {/* Resultado */}
                  {jogoEditando === jogo.id ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        className="w-12 rounded-lg border border-borda bg-fundo px-2 py-1 text-center"
                        value={jogoValores[jogo.id]?.g1 || ""}
                        onChange={(e) =>
                          setJogoValores({
                            ...jogoValores,
                            [jogo.id]: { ...jogoValores[jogo.id], g1: e.target.value },
                          })
                        }
                      />
                      <span className="font-semibold">-</span>
                      <input
                        type="number"
                        min="0"
                        className="w-12 rounded-lg border border-borda bg-fundo px-2 py-1 text-center"
                        value={jogoValores[jogo.id]?.g2 || ""}
                        onChange={(e) =>
                          setJogoValores({
                            ...jogoValores,
                            [jogo.id]: { ...jogoValores[jogo.id], g2: e.target.value },
                          })
                        }
                      />
                    </div>
                  ) : (
                    <div className="w-20 text-center font-bold">
                      {jogo.golos_equipa_1 !== null && jogo.golos_equipa_2 !== null
                        ? `${jogo.golos_equipa_1} - ${jogo.golos_equipa_2}`
                        : "—"}
                    </div>
                  )}

                  {/* Equipa 2 */}
                  <div className="flex flex-1 items-center gap-3">
                    <div className="flex-1 text-right">
                      <p className="font-semibold">{jogo.equipa_2?.nome || "—"}</p>
                    </div>
                  </div>

                  {/* Botão Editar/Salvar */}
                  {jogoEditando === jogo.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => salvarResultado(jogo.id)}
                        disabled={carregando}
                        className="rounded-lg bg-vitoria px-3 py-2 text-sm font-semibold text-vitoria-texto transition-opacity hover:opacity-80 disabled:opacity-50"
                      >
                        ✅ Salvar
                      </button>
                      <button
                        onClick={() => setJogoEditando(null)}
                        className="rounded-lg border border-borda px-3 py-2 text-sm font-semibold transition-colors hover:bg-fundo"
                      >
                        ✕ Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => iniciarEdicao(jogo)}
                      className="rounded-lg bg-clube/10 px-3 py-2 text-sm font-semibold text-clube transition-colors hover:bg-clube/20"
                    >
                      ✏️ Resultado
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disputa de 3º lugar */}
        {temTerceiroLugar && disputaTerceiro && (
          <div>
            <h3 className="mb-4 text-lg font-bold">🥉 Disputa de 3º Lugar</h3>
            <div className="rounded-2xl border border-borda bg-superficie p-6">
              <div className="flex items-center gap-6">
                {/* Equipa 1 */}
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex-1">
                    <p className="font-semibold">{disputaTerceiro.equipa_1?.nome || "Perdedor SF1"}</p>
                  </div>
                </div>

                {/* Resultado */}
                {jogoEditando === disputaTerceiro.id ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      className="w-12 rounded-lg border border-borda bg-fundo px-2 py-1 text-center"
                      value={jogoValores[disputaTerceiro.id]?.g1 || ""}
                      onChange={(e) =>
                        setJogoValores({
                          ...jogoValores,
                          [disputaTerceiro.id]: {
                            ...jogoValores[disputaTerceiro.id],
                            g1: e.target.value,
                          },
                        })
                      }
                    />
                    <span className="font-semibold">-</span>
                    <input
                      type="number"
                      min="0"
                      className="w-12 rounded-lg border border-borda bg-fundo px-2 py-1 text-center"
                      value={jogoValores[disputaTerceiro.id]?.g2 || ""}
                      onChange={(e) =>
                        setJogoValores({
                          ...jogoValores,
                          [disputaTerceiro.id]: {
                            ...jogoValores[disputaTerceiro.id],
                            g2: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                ) : (
                  <div className="w-20 text-center font-bold">
                    {disputaTerceiro.golos_equipa_1 !== null &&
                    disputaTerceiro.golos_equipa_2 !== null
                      ? `${disputaTerceiro.golos_equipa_1} - ${disputaTerceiro.golos_equipa_2}`
                      : "—"}
                  </div>
                )}

                {/* Equipa 2 */}
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex-1 text-right">
                    <p className="font-semibold">{disputaTerceiro.equipa_2?.nome || "Perdedor SF2"}</p>
                  </div>
                </div>

                {/* Botão Editar/Salvar */}
                {jogoEditando === disputaTerceiro.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => salvarResultado(disputaTerceiro.id)}
                      disabled={carregando}
                      className="rounded-lg bg-vitoria px-3 py-2 text-sm font-semibold text-vitoria-texto transition-opacity hover:opacity-80 disabled:opacity-50"
                    >
                      ✅ Salvar
                    </button>
                    <button
                      onClick={() => setJogoEditando(null)}
                      className="rounded-lg border border-borda px-3 py-2 text-sm font-semibold transition-colors hover:bg-fundo"
                    >
                      ✕ Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => iniciarEdicao(disputaTerceiro)}
                    className="rounded-lg bg-clube/10 px-3 py-2 text-sm font-semibold text-clube transition-colors hover:bg-clube/20"
                  >
                    ✏️ Resultado
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Final */}
        {final && (
          <div>
            <h3 className="mb-4 text-lg font-bold">🏆 Final</h3>
            <div className="rounded-2xl border-2 border-vitoria bg-vitoria/5 p-6">
              <div className="flex items-center gap-6">
                {/* Equipa 1 */}
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex-1">
                    <p className="font-semibold">{final.equipa_1?.nome || "Vencedor SF1"}</p>
                  </div>
                </div>

                {/* Resultado */}
                {jogoEditando === final.id ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      className="w-12 rounded-lg border border-borda bg-fundo px-2 py-1 text-center"
                      value={jogoValores[final.id]?.g1 || ""}
                      onChange={(e) =>
                        setJogoValores({
                          ...jogoValores,
                          [final.id]: { ...jogoValores[final.id], g1: e.target.value },
                        })
                      }
                    />
                    <span className="font-semibold">-</span>
                    <input
                      type="number"
                      min="0"
                      className="w-12 rounded-lg border border-borda bg-fundo px-2 py-1 text-center"
                      value={jogoValores[final.id]?.g2 || ""}
                      onChange={(e) =>
                        setJogoValores({
                          ...jogoValores,
                          [final.id]: { ...jogoValores[final.id], g2: e.target.value },
                        })
                      }
                    />
                  </div>
                ) : (
                  <div className="w-20 text-center font-bold text-lg">
                    {final.golos_equipa_1 !== null && final.golos_equipa_2 !== null
                      ? `${final.golos_equipa_1} - ${final.golos_equipa_2}`
                      : "—"}
                  </div>
                )}

                {/* Equipa 2 */}
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex-1 text-right">
                    <p className="font-semibold">{final.equipa_2?.nome || "Vencedor SF2"}</p>
                  </div>
                </div>

                {/* Botão Editar/Salvar */}
                {jogoEditando === final.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => salvarResultado(final.id)}
                      disabled={carregando}
                      className="rounded-lg bg-vitoria px-3 py-2 text-sm font-semibold text-vitoria-texto transition-opacity hover:opacity-80 disabled:opacity-50"
                    >
                      ✅ Salvar
                    </button>
                    <button
                      onClick={() => setJogoEditando(null)}
                      className="rounded-lg border border-borda px-3 py-2 text-sm font-semibold transition-colors hover:bg-fundo"
                    >
                      ✕ Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => iniciarEdicao(final)}
                    className="rounded-lg bg-vitoria/10 px-3 py-2 text-sm font-semibold text-vitoria transition-colors hover:bg-vitoria/20"
                  >
                    ✏️ Resultado
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
