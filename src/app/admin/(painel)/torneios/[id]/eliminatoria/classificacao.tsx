"use client";

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
  rodada: number;
  equipa_1?: Equipa | null;
  equipa_2?: Equipa | null;
}

interface ClassificacaoProps {
  jogos: Jogo[];
}

export function Classificacao({ jogos }: ClassificacaoProps) {
  // Separar por rodadas
  const semifinais = jogos.filter((j) => j.rodada === 1);
  const rodada2 = jogos.filter((j) => j.rodada === 2);

  // Verificar se todos os jogos têm resultado
  const todosConcluidos = jogos.every(
    (j) => j.golos_equipa_1 !== null && j.golos_equipa_2 !== null
  );

  if (!todosConcluidos) {
    return (
      <div className="rounded-2xl border border-borda-aviso bg-aviso/10 p-6">
        <p className="font-semibold text-aviso">⚠️ Eliminatória não concluída</p>
        <p className="mt-2 text-sm text-suave">
          Complete todos os jogos para ver a classificação final.
        </p>
      </div>
    );
  }

  // Encontrar vencedores e perdedores dos semi-finais
  const sf1 = semifinais[0];
  const sf2 = semifinais[1];

  const vencedor1 =
    sf1.golos_equipa_1! > sf1.golos_equipa_2! ? sf1.equipa_1 : sf1.equipa_2;
  const perdedor1 =
    sf1.golos_equipa_1! > sf1.golos_equipa_2! ? sf1.equipa_2 : sf1.equipa_1;

  const vencedor2 =
    sf2.golos_equipa_1! > sf2.golos_equipa_2! ? sf2.equipa_1 : sf2.equipa_2;
  const perdedor2 =
    sf2.golos_equipa_1! > sf2.golos_equipa_2! ? sf2.equipa_2 : sf2.equipa_1;

  // Encontrar resultado da disputa de 3º e final
  const disputa3 = rodada2[0];
  const final = rodada2[1];

  const vencedor3 =
    disputa3.golos_equipa_1! > disputa3.golos_equipa_2!
      ? disputa3.equipa_1
      : disputa3.equipa_2;
  const perdedor3 =
    disputa3.golos_equipa_1! > disputa3.golos_equipa_2!
      ? disputa3.equipa_2
      : disputa3.equipa_1;

  const vencedorFinal =
    final.golos_equipa_1! > final.golos_equipa_2!
      ? final.equipa_1
      : final.equipa_2;
  const perdedorFinal =
    final.golos_equipa_1! > final.golos_equipa_2!
      ? final.equipa_2
      : final.equipa_1;

  // Montar classificação
  const classificacao = [
    { posicao: "🥇 1º Lugar", equipa: vencedorFinal, resultado: `${final.golos_equipa_1} - ${final.golos_equipa_2}` },
    { posicao: "🥈 2º Lugar", equipa: perdedorFinal, resultado: `${final.golos_equipa_2} - ${final.golos_equipa_1}` },
    { posicao: "🥉 3º Lugar", equipa: vencedor3, resultado: `${disputa3.golos_equipa_1} - ${disputa3.golos_equipa_2}` },
    { posicao: "4️⃣ 4º Lugar", equipa: perdedor3, resultado: `${disputa3.golos_equipa_2} - ${disputa3.golos_equipa_1}` },
  ];

  return (
    <div className="rounded-2xl border border-borda bg-superficie p-6">
      <h2 className="mb-6 text-2xl font-bold">🏆 Classificação Final</h2>
      <div className="space-y-3">
        {classificacao.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between rounded-xl p-4 ${
              idx === 0
                ? "border-2 border-vitoria bg-vitoria/5"
                : idx === 1
                  ? "border border-borda bg-superficie"
                  : idx === 2
                    ? "border border-borda bg-superficie"
                    : "border border-borda bg-superficie/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">{item.posicao}</span>
              <span className="text-lg font-semibold">{item.equipa?.nome}</span>
            </div>
            <span className="text-sm text-suave">{item.resultado}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
