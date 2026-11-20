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
      .from("regras_qualificacao_torneio" as any)
      .select("*")
      .eq("torneio_id", id)
      .order("ordem");

    if (!regras || regras.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma regra de qualificação configurada" },
        { status: 400 }
      );
    }

    // 2. Buscar todas as fases de grupos
    const { data: fases } = await supabase
      .from("fases_torneio" as any)
      .select("*")
      .eq("torneio_id", id)
      .eq("tipo", "grupo");

    if (!fases || fases.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma fase de grupos encontrada" },
        { status: 400 }
      );
    }

    // 3. Buscar todos os jogos realizados
    const { data: jogos } = await supabase
      .from("jogos_torneio" as any)
      .select("*")
      .eq("torneio_id", id);

    // 4. Para cada fase de grupo, calcular classificação
    const apurantesParaInserir: any[] = [];

    for (const fase of fases) {
      // Buscar equipas desta fase
      const { data: equipasFase } = await supabase
        .from("equipas_torneio" as any)
        .select("*")
        .eq("fase_torneio_id", fase.id);

      if (!equipasFase || equipasFase.length === 0) continue;

      // Calcular estatísticas para cada equipa
      const estatisticas = equipasFase.map((equipa) => {
        const jogosEquipa = (jogos || []).filter(
          (j) =>
            (j.equipa_1_id === equipa.id || j.equipa_2_id === equipa.id) &&
            j.fase_torneio_id === fase.id &&
            j.golos_equipa_1 !== null &&
            j.golos_equipa_2 !== null
        );

        let pontos = 0;
        let gm = 0;
        let gs = 0;

        jogosEquipa.forEach((jogo) => {
          const eh1 = jogo.equipa_1_id === equipa.id;
          const golsF = eh1 ? jogo.golos_equipa_1 : jogo.golos_equipa_2;
          const golsC = eh1 ? jogo.golos_equipa_2 : jogo.golos_equipa_1;

          gm += golsF || 0;
          gs += golsC || 0;

          if (golsF > golsC) pontos += 3;
          else if (golsF === golsC) pontos += 1;
        });

        return {
          id: equipa.id,
          nome: equipa.nome,
          pontos,
          gm,
          gs,
          dg: gm - gs,
          jogos: jogosEquipa.length,
        };
      });

      // Ordenar por pontos, diferença de golos, golos marcados
      estatisticas.sort((a, b) => {
        if (b.pontos !== a.pontos) return b.pontos - a.pontos;
        if (b.dg !== a.dg) return b.dg - a.dg;
        return b.gm - a.gm;
      });

      // 5. Aplicar regras de qualificação
      for (const regra of regras) {
        const posicoes = regra.posicoes || [];
        const equipasQualificadas = estatisticas
          .filter((e, idx) => posicoes.includes(idx + 1))
          .slice(0, regra.num_equipas);

        for (const equipa of equipasQualificadas) {
          apurantesParaInserir.push({
            torneio_id: id,
            equipa_id: equipa.id,
            regra_id: regra.id,
          });
        }
      }
    }

    if (apurantesParaInserir.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma equipa qualificada pelas regras" },
        { status: 400 }
      );
    }

    // 6. Limpar apuramentos antigos
    await supabase
      .from("apuramentos_torneio" as any)
      .delete()
      .eq("torneio_id", id);

    // 7. Inserir novos apuramentos
    const { error: erroInserir } = await supabase
      .from("apuramentos_torneio" as any)
      .insert(apurantesParaInserir as any);

    if (erroInserir) {
      console.error("Erro ao inserir apuramentos:", erroInserir);
      return NextResponse.json(
        { error: "Erro ao aplicar qualificação" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      equipasApuradas: apurantesParaInserir.length,
    });
  } catch (erro) {
    console.error("Erro na aplicação de qualificação:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
