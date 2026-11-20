import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const torneioId = "96f389ff-dbaf-4c47-a71d-faa990bfaba4";

    // Pegar todos os jogos
    const { data: jogos, error: errJogos } = await supabase
      .from("jogos_torneio" as any)
      .select("*")
      .eq("torneio_id", torneioId)
      .order("rodada", { ascending: true })
      .order("id", { ascending: true });

    if (errJogos || !jogos) {
      return NextResponse.json({ error: "Erro ao buscar jogos" }, { status: 500 });
    }

    // Resultados pré-definidos
    const resultados: Record<string, [number, number]> = {
      // Grupo A
      "0": [2, 3], // C vs P
      "1": [1, 0], // D vs G
      "2": [2, 1], // C vs G
      "3": [2, 1], // P vs D
      "4": [0, 0], // C vs D
      "5": [0, 4], // G vs P
      // Grupo B
      "6": [3, 1], // E vs Y
      "7": [2, 0], // K vs T
      "8": [0, 2], // E vs T
      "9": [2, 0], // Y vs K
      "10": [1, 1], // E vs K
      "11": [1, 1], // T vs Y
    };

    // Atualizar cada jogo com resultados
    let atualizado = 0;
    for (let i = 0; i < jogos.length && i < 12; i++) {
      const resultado = resultados[i.toString()];
      if (resultado) {
        const { error: errUpdate } = await supabase
          .from("jogos_torneio" as any)
          .update({
            golos_equipa_1: resultado[0],
            golos_equipa_2: resultado[1],
            estado: "final",
          })
          .eq("id", jogos[i].id);

        if (!errUpdate) {
          atualizado++;
        }
      }
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: `${atualizado} jogos atualizados com resultados`,
      jogos_atualizados: atualizado,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
