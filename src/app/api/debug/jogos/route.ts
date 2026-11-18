import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const torneioId = "96f389ff-dbaf-4c47-a71d-faa990bfaba4";

    // Total games count
    const { data: totalGames, error: err1 } = await supabase
      .from("jogos_torneio")
      .select("*", { count: "exact" })
      .eq("torneio_id", torneioId);

    // Games with results
    const { data: gamesWithResults, error: err2 } = await supabase
      .from("jogos_torneio")
      .select("*")
      .eq("torneio_id", torneioId)
      .not("golos_equipa_1", "is", null)
      .not("golos_equipa_2", "is", null);

    // Games per team
    const { data: allGames, error: err3 } = await supabase
      .from("jogos_torneio")
      .select(`
        id,
        equipa_1_id,
        equipa_2_id,
        golos_equipa_1,
        golos_equipa_2,
        rodada,
        fase_torneio_id,
        equipa_1:equipas_torneio!equipa_1_id(id, nome, fase_torneio_id),
        equipa_2:equipas_torneio!equipa_2_id(id, nome, fase_torneio_id)
      `)
      .eq("torneio_id", torneioId);

    // Count by team
    let countByTeam: Record<string, number> = {};
    if (allGames) {
      allGames.forEach((jogo: any) => {
        const hasResult = jogo.golos_equipa_1 !== null && jogo.golos_equipa_2 !== null;
        if (hasResult) {
          countByTeam[jogo.equipa_1_id] = (countByTeam[jogo.equipa_1_id] || 0) + 1;
          countByTeam[jogo.equipa_2_id] = (countByTeam[jogo.equipa_2_id] || 0) + 1;
        }
      });
    }

    return NextResponse.json({
      total_games: totalGames?.length || 0,
      games_with_results: gamesWithResults?.length || 0,
      count_by_team: countByTeam,
      sample_games: allGames?.slice(0, 5) || [],
      all_games_detail: allGames || [],
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
