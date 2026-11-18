import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface Regra {
  id?: string;
  nome: string;
  descricao: string;
  tipo: "apuramento_direto" | "disputa" | "liga_secundaria" | "eliminatoria" | "melhores_terceiros";
  criterio: "posicao" | "melhores_terceiros" | "todos_de_posicao" | "manual";
  num_equipas: number;
  posicoes: number[];
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await req.json();
    const { regras } = body as { regras: Regra[] };

    if (!regras || regras.length === 0) {
      return NextResponse.json({ error: "Nenhuma regra fornecida" }, { status: 400 });
    }

    // Obter torneio
    const { data: torneio, error: erroTorneio } = await supabase
      .from("torneios")
      .select("*")
      .eq("id", id)
      .single();

    if (erroTorneio || !torneio) {
      return NextResponse.json({ error: "Torneio não encontrado" }, { status: 404 });
    }

    // Deletar regras antigas
    await supabase.from("regras_qualificacao_torneio").delete().eq("torneio_id", id);

    // Inserir novas regras
    for (let i = 0; i < regras.length; i++) {
      const regra = regras[i];
      await supabase.from("regras_qualificacao_torneio").insert({
        torneio_id: id,
        nome: regra.nome,
        descricao: regra.descricao,
        tipo: regra.tipo,
        criterio: regra.criterio,
        num_equipas: regra.num_equipas,
        posicoes: regra.posicoes,
        ordem: i,
      });
    }

    // Se há uma regra de eliminatória, gerar apuramentos e criar fase
    const regraEliminatoria = regras.find((r) => r.tipo === "eliminatoria");
    if (regraEliminatoria) {
      // Obter grupos
      let { data: grupos } = await supabase
        .from("fases_torneio")
        .select("*")
        .eq("torneio_id", id)
        .eq("tipo", "grupos");

      // Se não há fases de grupos registradas, criar baseado nos jogos
      if (!grupos || grupos.length === 0) {
        // Buscar todas as fases do torneio e criar fases de grupos se necessário
        const { data: todasAsFases } = await supabase
          .from("fases_torneio")
          .select("*")
          .eq("torneio_id", id);

        // Se há fases mas nenhuma é de grupos, procurar por grupos nos jogos
        if (todasAsFases && todasAsFases.length > 0) {
          // Usar a primeira fase como grupos (assumindo que é a fase de grupos)
          grupos = [todasAsFases[0]];
        } else {
          // Se ainda não há fases, criar uma fase de grupos
          const { data: novaFase, error: erroNovaFase } = await supabase
            .from("fases_torneio")
            .insert({
              torneio_id: id,
              nome: "Grupos",
              tipo: "grupos",
              ordem: 1,
            })
            .select();

          if (erroNovaFase || !novaFase || novaFase.length === 0) {
            return NextResponse.json(
              { error: "Erro ao criar fase de grupos" },
              { status: 400 }
            );
          }
          grupos = novaFase;
        }
      }

      // Para cada grupo, buscar as top 2 equipas e criar apuramentos
      const equipasApuradas = [];
      for (const grupo of grupos) {
        // Buscar classificação do grupo
        const { data: jogosGrupo } = await supabase
          .from("jogos_torneio")
          .select("*, equipa_1:equipa_1_id(*), equipa_2:equipa_2_id(*)")
          .eq("fase_torneio_id", grupo.id);

        if (!jogosGrupo || jogosGrupo.length === 0) continue;

        // Calcular pontos das equipas
        const equipasPontos: Record<string, { id: string; nome: string; pontos: number; saldo: number }> = {};

        for (const jogo of jogosGrupo) {
          if (
            !jogo.golos_equipa_1 ||
            !jogo.golos_equipa_2 ||
            !jogo.equipa_1 ||
            !jogo.equipa_2
          ) {
            continue;
          }

          const equipa1 = jogo.equipa_1;
          const equipa2 = jogo.equipa_2;
          const g1 = jogo.golos_equipa_1;
          const g2 = jogo.golos_equipa_2;

          if (!equipasPontos[equipa1.id]) {
            equipasPontos[equipa1.id] = { id: equipa1.id, nome: equipa1.nome, pontos: 0, saldo: 0 };
          }
          if (!equipasPontos[equipa2.id]) {
            equipasPontos[equipa2.id] = { id: equipa2.id, nome: equipa2.nome, pontos: 0, saldo: 0 };
          }

          equipasPontos[equipa1.id].saldo += g1 - g2;
          equipasPontos[equipa2.id].saldo += g2 - g1;

          if (g1 > g2) {
            equipasPontos[equipa1.id].pontos += torneio.vitoria_pontos || 3;
            equipasPontos[equipa2.id].pontos += torneio.empate_pontos || 0;
          } else if (g2 > g1) {
            equipasPontos[equipa2.id].pontos += torneio.vitoria_pontos || 3;
            equipasPontos[equipa1.id].pontos += torneio.empate_pontos || 0;
          } else {
            equipasPontos[equipa1.id].pontos += torneio.empate_pontos || 1;
            equipasPontos[equipa2.id].pontos += torneio.empate_pontos || 1;
          }
        }

        // Ordenar equipas por pontos e saldo
        const equipasOrdenadas = Object.values(equipasPontos).sort((a, b) => {
          if (b.pontos !== a.pontos) return b.pontos - a.pontos;
          return b.saldo - a.saldo;
        });

        // Pegar top N equipas conforme a posição
        for (const posicao of regraEliminatoria.posicoes) {
          if (equipasOrdenadas[posicao - 1]) {
            equipasApuradas.push({
              torneio_id: id,
              equipa_id: equipasOrdenadas[posicao - 1].id,
              grupo_id: grupo.id,
              posicao: posicao,
            });
          }
        }
      }

      // Verificar se temos as equipas apuradas
      if (equipasApuradas.length > 0) {
        // Deletar apuramentos antigos
        await supabase.from("apuramentos_torneio").delete().eq("torneio_id", id);

        // Inserir novos apuramentos
        for (const apuramento of equipasApuradas) {
          await supabase.from("apuramentos_torneio").insert(apuramento);
        }

        // Criar fase de eliminação
        const { error: erroFase } = await supabase
          .from("fases_torneio")
          .insert({
            torneio_id: id,
            nome: "Eliminatória",
            tipo: "eliminatoria",
            ordem: 2,
          });

        if (erroFase) {
          console.error("Erro ao criar fase de eliminação:", erroFase);
        }

        // Gerar jogos de eliminação (semi-finais)
        const faseEliminacao = await supabase
          .from("fases_torneio")
          .select("id")
          .eq("torneio_id", id)
          .eq("tipo", "eliminatoria")
          .single();

        if (faseEliminacao.data) {
          // Buscar as 8 equipas apuradas
          const { data: apuramentos } = await supabase
            .from("apuramentos_torneio")
            .select("*, equipa:equipa_id(id, nome)")
            .eq("torneio_id", id)
            .order("posicao");

          if (apuramentos && apuramentos.length >= 8) {
            // Criar 4 jogos de semi-finais (1º vs 8º, 2º vs 7º, 3º vs 6º, 4º vs 5º)
            const matchups = [
              [0, 7], // 1º vs 8º
              [1, 6], // 2º vs 7º
              [2, 5], // 3º vs 6º
              [3, 4], // 4º vs 5º
            ];

            for (const [idx1, idx2] of matchups) {
              await supabase.from("jogos_torneio").insert({
                torneio_id: id,
                fase_torneio_id: faseEliminacao.data.id,
                equipa_1_id: apuramentos[idx1].equipa_id,
                equipa_2_id: apuramentos[idx2].equipa_id,
                rodada: 1,
                tipo_jogo: "meia_final",
                estado: "agendado",
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (erro) {
    console.error("Erro na API de qualificação:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
