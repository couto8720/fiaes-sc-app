const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://yxbrnfcvmkctrcgexmld.supabase.co";
const supabaseKey = "sb_secret_A5I1OR_11UGnFfBrI5IgeQ_l2cHpgM-";

const supabase = createClient(supabaseUrl, supabaseKey);

async function addJornadas() {
  try {
    console.log("Buscando jogos de Jornada 1...");

    const { data: jogos, error } = await supabase
      .from("jogos_torneio")
      .select("*")
      .or("rodada.eq.1,rodada.is.null");

    if (error) {
      console.error("Erro ao buscar jogos:", error);
      return;
    }

    console.log(`Encontrados ${jogos?.length || 0} jogos`);

    // Adicionar Rodada 2
    console.log("Adicionando Rodada 2...");
    const jornada2 = jogos?.map((jogo) => ({
      torneio_id: jogo.torneio_id,
      equipa_1_id: jogo.equipa_1_id,
      equipa_2_id: jogo.equipa_2_id,
      golos_equipa_1: null,
      golos_equipa_2: null,
      data_hora: jogo.data_hora
        ? new Date(new Date(jogo.data_hora).getTime() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
        : null,
      grupo: jogo.grupo,
      fase: jogo.fase,
      rodada: 2,
    }));

    if (jornada2 && jornada2.length > 0) {
      const { error: error2 } = await supabase
        .from("jogos_torneio")
        .insert(jornada2);
      if (error2) console.error("Erro ao adicionar Rodada 2:", error2);
      else console.log("✅ Rodada 2 adicionada!");
    }

    // Adicionar Rodada 3
    console.log("Adicionando Rodada 3...");
    const jornada3 = jogos?.map((jogo) => ({
      torneio_id: jogo.torneio_id,
      equipa_1_id: jogo.equipa_1_id,
      equipa_2_id: jogo.equipa_2_id,
      golos_equipa_1: null,
      golos_equipa_2: null,
      data_hora: jogo.data_hora
        ? new Date(new Date(jogo.data_hora).getTime() + 14 * 24 * 60 * 60 * 1000)
            .toISOString()
        : null,
      grupo: jogo.grupo,
      fase: jogo.fase,
      jornada: 3,
    }));

    if (jornada3 && jornada3.length > 0) {
      const { error: error3 } = await supabase
        .from("jogos_torneio")
        .insert(jornada3);
      if (error3) console.error("Erro ao adicionar Rodada 3:", error3);
      else console.log("✅ Rodada 3 adicionada!");
    }

    console.log("✅ Todas as jornadas foram adicionadas com sucesso!");
    process.exit(0);
  } catch (err) {
    console.error("Erro:", err);
    process.exit(1);
  }
}

addJornadas();
