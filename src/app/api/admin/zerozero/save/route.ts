import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exigirSessao } from "@/lib/sessao";
import { randomUUID } from "crypto";
import type { EstadoJogo } from "@/lib/supabase/database.types";

export async function POST(request: NextRequest) {
  try {
    // Verificar permissão
    const sessao = await exigirSessao();
    if (!sessao.superAdmin) {
      return NextResponse.json(
        { message: "Acesso negado. Apenas Super Admin." },
        { status: 403 }
      );
    }

    const { escalaoId, tipo, dados } = await request.json();

    if (!escalaoId || !tipo || !Array.isArray(dados)) {
      return NextResponse.json(
        { message: "Dados inválidos" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    if (tipo === "jogos") {
      // Salvar jogos
      const jogosParaInserir = dados.map((jogo: any) => ({
        escalao_id: escalaoId,
        data_hora: `${jogo.data}T${jogo.hora}:00Z`,
        adversario: jogo.adversario,
        em_casa: jogo.em_casa,
        jornada: jogo.jornada || null,
        estado: "agendado" as EstadoJogo,
      }));

      const { error } = await supabase
        .from("jogos")
        .insert(jogosParaInserir);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: `${jogosParaInserir.length} jogos salvos com sucesso`,
      });
    } else if (tipo === "classificacao") {
      // Salvar classificação
      const classificacaoParaInserir = dados.map((linha: any) => ({
        id: randomUUID(),
        escalao_id: escalaoId,
        posicao: linha.posicao,
        equipa: linha.equipa,
        jogos: linha.jogos,
        vitorias: linha.vitorias,
        empates: linha.empates,
        derrotas: linha.derrotas,
        golos_marcados: linha.golos_marcados,
        golos_sofridos: linha.golos_sofridos,
        pontos: linha.pontos,
        e_o_clube: false,
        atualizado_em: new Date().toISOString(),
      }));

      // Deletar classificação anterior
      await supabase
        .from("classificacoes")
        .delete()
        .eq("escalao_id", escalaoId);

      const { error } = await supabase
        .from("classificacoes")
        .insert(classificacaoParaInserir);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: `Classificação atualizada com ${classificacaoParaInserir.length} equipas`,
      });
    } else if (tipo === "resultados") {
      // Salvar resultados (atualizar jogos existentes)
      let atualizados = 0;

      for (const resultado of dados) {
        const [clubeGolos, adversarioGolos] = resultado.placar
          .split("-")
          .map(Number);

        const { error } = await supabase
          .from("jogos")
          .update({
            golos_clube: clubeGolos,
            golos_adversario: adversarioGolos,
            estado: "final",
            estado_desde: new Date().toISOString(),
          })
          .eq("escalao_id", escalaoId)
          .eq("adversario", resultado.adversario);

        if (!error) atualizados++;
      }

      return NextResponse.json({
        success: true,
        message: `${atualizados} resultados salvos com sucesso`,
      });
    }

    return NextResponse.json(
      { message: "Tipo de importação inválido" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erro ao salvar dados:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
