import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Buscar regras de qualificação
    const { data: regras } = await supabase
      .from("regras_qualificacao_torneio")
      .select("*")
      .eq("torneio_id", id)
      .order("ordem");

    if (!regras || regras.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma regra de qualificação configurada" },
        { status: 400 }
      );
    }

    // 2. Buscar todas as equipas e jogos
    const { data: equipas } = await supabase
      .from("equipas_torneio")
      .select("*")
      .eq("torneio_id", id);

    const { data: fases } = await supabase
      .from("fases_torneio")
      .select("*")
      .eq("torneio_id", id);

    const { data: jogos } = await supabase
      .from("jogos_torneio")
      .select("*")
      .eq("torneio_id", id)
      .eq("realizado", true);

    if (!equipas || !fases || !jogos) {
      return NextResponse.json(
        { error: "Erro ao buscar dados" },
        { status: 500 }
      );
    }

    // 3. Calcular classificação por grupo
    const equipasPorGrupo = new Map<string, any[]>();

    fases.forEach((fase) => {
      const equipasDaFase = equipas.filter((e) => e.fase_torneio_id === fase.id);
      const classificacao = equipasDaFase.map((equipa) => {
        const jogosEquipa = jogos.filter(
          (j) => (j.equipa_1_id === equipa.id || j.equipa_2_id === equipa.id)
        );

        let pontos = 0;
        let gm = 0;
        let gs = 0;

        jogosEquipa.forEach((jogo) => {
          const eh1 = jogo.equipa_1_id === equipa.id;
          const golsF = eh1 ? jogo.gols_equipa_1 : jogo.gols_equipa_2;
          const golsC = eh1 ? jogo.gols_equipa_2 : jogo.gols_equipa_1;

          if (golsF == null || golsC == null) return;

          gm += golsF;
          gs += golsC;

          if (golsF > golsC) pontos += 3;
          else if (golsF === golsC) pontos += 1;
        });

        return { equipa, pontos, gm, gs, dg: gm - gs };
      });

      classificacao.sort((a, b) => {
        if (b.pontos !== a.pontos) return b.pontos - a.pontos;
        if (b.dg !== a.dg) return b.dg - a.dg;
        return b.gm - a.gm;
      });

      equipasPorGrupo.set(fase.id, classificacao);
    });

    // 4. Aplicar regras de qualificação
    const apuramentosParaInserir: any[] = [];
    const equipasApuradas = new Set<string>();

    for (const regra of regras) {
      const equipasRegra: any[] = [];

      // Buscar equipas conforme o critério
      if (regra.criterio === "posicao") {
        // Buscar por posições específicas (1º, 2º, etc)
        for (const faseId of equipasPorGrupo.keys()) {
          const classificacao = equipasPorGrupo.get(faseId) || [];
          regra.posicoes.forEach((posicao) => {
            const equipa = classificacao[posicao - 1];
            if (equipa && !equipasApuradas.has(equipa.equipa.id)) {
              equipasRegra.push(equipa.equipa);
            }
          });
        }
      } else if (regra.criterio === "todos_de_posicao") {
        // Todos que ficarem numa posição específica
        const posicao = regra.posicoes[0] || 1;
        for (const faseId of equipasPorGrupo.keys()) {
          const classificacao = equipasPorGrupo.get(faseId) || [];
          const equipa = classificacao[posicao - 1];
          if (equipa && !equipasApuradas.has(equipa.equipa.id)) {
            equipasRegra.push(equipa.equipa);
          }
        }
      }

      // Limitar ao número de equipas da regra
      equipasRegra.slice(0, regra.num_equipas).forEach((equipa) => {
        apuramentosParaInserir.push({
          torneio_id: id,
          regra_id: regra.id,
          equipa_id: equipa.id,
        });
        equipasApuradas.add(equipa.id);
      });
    }

    // 5. Limpar apuramentos antigos
    await supabase.from("apuramentos_torneio").delete().eq("torneio_id", id);

    // 6. Inserir novos apuramentos
    if (apuramentosParaInserir.length > 0) {
      const { error: erroInserir } = await supabase
        .from("apuramentos_torneio")
        .insert(apuramentosParaInserir);

      if (erroInserir) {
        console.error("Erro ao inserir apuramentos:", erroInserir);
        return NextResponse.json(
          { error: "Erro ao aplicar qualificação" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      sucesso: true,
      equipasApuradas: apuramentosParaInserir.length,
    });
  } catch (erro) {
    console.error("Erro na aplicação de qualificação:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
