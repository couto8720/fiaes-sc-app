import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addJornadas() {
  try {
    console.log("Buscando jogos de Jornada 1...");

    const { data: jogos, error } = await supabase
      .from("jogos_torneio")
      .select("*")
      .or("jornada.eq.1,jornada.is.null");

    if (error) {
      console.error("Erro ao buscar jogos:", error);
      return;
    }

    console.log(`Encontrados ${jogos?.length || 0} jogos`);

    // Adicionar Jornada 2
    console.log("Adicionando Jornada 2...");
    const jornada2 = jogos?.map((jogo) => ({
      ...jogo,
      id: undefined,
      jornada: 2,
      golos_equipa_1: null,
      golos_equipa_2: null,
      data_hora: jogo.data_hora
        ? new Date(new Date(jogo.data_hora).getTime() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
        : null,
    }));

    if (jornada2 && jornada2.length > 0) {
      const { error: error2 } = await supabase
        .from("jogos_torneio")
        .insert(jornada2);
      if (error2) console.error("Erro ao adicionar Jornada 2:", error2);
      else console.log("✅ Jornada 2 adicionada!");
    }

    // Adicionar Jornada 3
    console.log("Adicionando Jornada 3...");
    const jornada3 = jogos?.map((jogo) => ({
      ...jogo,
      id: undefined,
      jornada: 3,
      golos_equipa_1: null,
      golos_equipa_2: null,
      data_hora: jogo.data_hora
        ? new Date(new Date(jogo.data_hora).getTime() + 14 * 24 * 60 * 60 * 1000)
            .toISOString()
        : null,
    }));

    if (jornada3 && jornada3.length > 0) {
      const { error: error3 } = await supabase
        .from("jogos_torneio")
        .insert(jornada3);
      if (error3) console.error("Erro ao adicionar Jornada 3:", error3);
      else console.log("✅ Jornada 3 adicionada!");
    }

    console.log("✅ Todas as jornadas foram adicionadas com sucesso!");
  } catch (err) {
    console.error("Erro:", err);
  }
}

addJornadas();
