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
    console.log("🔵 POST /api/qualificacao - ID:", id);

    const supabase = await createClient();
    const body = await req.json();
    const { regras } = body as { regras: Regra[] };

    if (!regras || regras.length === 0) {
      console.log("🔴 Erro: Nenhuma regra fornecida");
      return NextResponse.json({ error: "Nenhuma regra fornecida" }, { status: 400 });
    }

    console.log("📋 Regras recebidas:", regras.length, regras.map(r => r.tipo));

    // Obter torneio
    const { data: torneio, error: erroTorneio } = await supabase
      .from("torneios")
      .select("*")
      .eq("id", id)
      .single();

    if (erroTorneio || !torneio) {
      console.log("🔴 Erro: Torneio não encontrado");
      return NextResponse.json({ error: "Torneio não encontrado" }, { status: 404 });
    }

    console.log("✅ Torneio encontrado:", torneio.nome);

    // Deletar regras antigas
    await supabase.from("regras_qualificacao_torneio").delete().eq("torneio_id", id);
    console.log("🗑️ Regras antigas deletadas");

    // Inserir novas regras
    for (let i = 0; i < regras.length; i++) {
      const regra = regras[i];
      const { error: erroInsert } = await supabase.from("regras_qualificacao_torneio").insert({
        torneio_id: id,
        nome: regra.nome,
        descricao: regra.descricao,
        tipo: regra.tipo,
        criterio: regra.criterio,
        num_equipas: regra.num_equipas,
        posicoes: regra.posicoes,
        ordem: i,
      });

      if (erroInsert) {
        console.error("🔴 Erro ao inserir regra:", erroInsert);
      } else {
        console.log(`✅ Regra ${i + 1} inserida:`, regra.tipo);
      }
    }

    // Se há uma regra de eliminatória, gerar apuramentos e criar fase
    const regraEliminatoria = regras.find((r) => r.tipo === "eliminatoria");
    if (regraEliminatoria) {
      console.log("🏆 Regra de eliminatória encontrada. Criando fase...");

      // Deletar TODAS as fases de eliminação antigas
      await supabase
        .from("fases_torneio")
        .delete()
        .eq("torneio_id", id)
        .eq("tipo", "eliminatoria");

      // Criar uma nova fase de eliminação
      const { data: novaFase, error: erroFase } = await supabase
        .from("fases_torneio")
        .insert({
          torneio_id: id,
          nome: "Eliminatória",
          tipo: "eliminatoria",
          estado: "planejamento",
        })
        .select()
        .single();

      if (erroFase || !novaFase) {
        console.error("🔴 Erro ao criar fase de eliminação:", erroFase);
        return NextResponse.json({ error: `Erro ao criar fase: ${JSON.stringify(erroFase)}` }, { status: 500 });
      }

      const faseEliminacaoId = novaFase.id;
      console.log("✅ Fase de eliminação criada:", faseEliminacaoId);
      // Obter grupos
      let { data: grupos } = await supabase
        .from("fases_torneio")
        .select("*")
        .eq("torneio_id", id)
        .eq("tipo", "grupos");

      // Se não há fases de grupos registradas, buscar TODOS os jogos e agrupar manualmente
      if (!grupos || grupos.length === 0) {
        // Buscar todas as fases do torneio
        const { data: todasAsFases } = await supabase
          .from("fases_torneio")
          .select("*")
          .eq("torneio_id", id)
          .neq("tipo", "eliminatoria");

        // Usar todas as fases que não são de eliminatória como grupos
        if (todasAsFases && todasAsFases.length > 0) {
          grupos = todasAsFases;
          console.log("📂 Fases encontradas (não-eliminatória):", grupos.length);
        } else {
          // Se ainda não há nenhuma fase, criar uma genérica
          const { data: novaFase, error: erroNovaFase } = await supabase
            .from("fases_torneio")
            .insert({
              torneio_id: id,
              nome: "Grupos",
              tipo: "grupos",
              estado: "planejamento",
            })
            .select()
            .single();

          if (erroNovaFase || !novaFase) {
            return NextResponse.json(
              { error: "Erro ao criar fase de grupos" },
              { status: 400 }
            );
          }
          grupos = [novaFase];
        }
      }

      // Para cada grupo, buscar as top 2 equipas e criar apuramentos
      const equipasApuradas = [];
      console.log("📊 Total de grupos:", grupos.length);

      for (const grupo of grupos) {
        console.log("📂 Processando grupo:", grupo.id, "-", grupo.nome);

        // Buscar classificação do grupo
        const { data: jogosGrupo } = await supabase
          .from("jogos_torneio")
          .select("*, equipa_1:equipa_1_id(*), equipa_2:equipa_2_id(*)")
          .eq("fase_torneio_id", grupo.id);

        console.log("🎮 Jogos encontrados para grupo:", jogosGrupo?.length || 0);

        if (!jogosGrupo || jogosGrupo.length === 0) {
          console.log("⏭️  Nenhum jogo encontrado, pulando grupo");
          continue;
        }

        // Calcular pontos das equipas
        const equipasPontos: Record<string, { id: string; nome: string; pontos: number; saldo: number }> = {};

        let jogosProcessados = 0;
        for (const jogo of jogosGrupo) {
          if (
            jogo.golos_equipa_1 === null ||
            jogo.golos_equipa_2 === null ||
            !jogo.equipa_1 ||
            !jogo.equipa_2
          ) {
            console.log("⏭️ Jogo sem resultado:", {
              g1: jogo.golos_equipa_1,
              g2: jogo.golos_equipa_2,
              e1: jogo.equipa_1?.nome,
              e2: jogo.equipa_2?.nome,
            });
            continue;
          }
          jogosProcessados++;

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

        // Buscar TODAS as equipas do torneio e adicionar as que não têm resultados
        const { data: todasEquipas } = await supabase
          .from("equipas_torneio")
          .select("id, nome")
          .eq("torneio_id", id);

        if (todasEquipas) {
          for (const equipa of todasEquipas) {
            if (!equipasPontos[equipa.id]) {
              equipasPontos[equipa.id] = { id: equipa.id, nome: equipa.nome, pontos: 0, saldo: 0 };
            }
          }
        }

        // Ordenar equipas por pontos e saldo
        const equipasOrdenadas = Object.values(equipasPontos).sort((a, b) => {
          if (b.pontos !== a.pontos) return b.pontos - a.pontos;
          return b.saldo - a.saldo;
        });

        console.log("🏆 Equipas ordenadas para grupo:", equipasOrdenadas.map(e => `${e.nome} (${e.pontos}pts)`));

        // Pegar top N equipas conforme a posição
        for (const posicao of regraEliminatoria.posicoes) {
          if (equipasOrdenadas[posicao - 1]) {
            console.log(`✅ Apurando equipa posição ${posicao}:`, equipasOrdenadas[posicao - 1].nome);
            equipasApuradas.push({
              torneio_id: id,
              equipa_id: equipasOrdenadas[posicao - 1].id,
              grupo_id: grupo.id,
              posicao: posicao,
            });
          }
        }
      }

      console.log("📋 Total equipas apuradas encontradas:", equipasApuradas.length);

      // Verificar se temos as equipas apuradas
      if (equipasApuradas.length > 0) {
        // Deletar apuramentos antigos
        await supabase.from("apuramentos_torneio").delete().eq("torneio_id", id);

        // Inserir novos apuramentos
        for (const apuramento of equipasApuradas) {
          await supabase.from("apuramentos_torneio").insert(apuramento);
        }

        console.log("✅ Apuramentos criados:", equipasApuradas.length);
      }
    }

    return NextResponse.json({ success: true });
  } catch (erro) {
    console.error("Erro na API de qualificação:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
