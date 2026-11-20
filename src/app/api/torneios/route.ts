import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const { nome, descricao, formato, num_grupos, equipas_por_grupo, avancar_por_grupo, vitoria_pontos, empate_pontos, criado_por } = body;

    // Validar
    if (!nome || !formato || !criado_por) {
      return NextResponse.json({ error: "Dados obrigatórios faltam" }, { status: 400 });
    }

    // Criar torneio
    const { data: torneio, error: erroCriar } = await supabase
      .from("torneios" as any)
      .insert({
        nome,
        descricao,
        formato,
        num_grupos,
        equipas_por_grupo,
        avancar_por_grupo,
        vitoria_pontos,
        empate_pontos,
        criado_por,
        estado: "planejamento",
      })
      .select()
      .single();

    if (erroCriar || !torneio) {
      console.error("Erro ao criar torneio:", erroCriar?.message || erroCriar);

      const mensagemErro = erroCriar?.message || "Desconhecido";

      // Se o erro é sobre tabela não existente, mostra instruções
      if (
        mensagemErro.includes("Could not find the table") ||
        (mensagemErro.includes("relation") && mensagemErro.includes("does not exist")) ||
        mensagemErro.includes("PGRST205")
      ) {
        return NextResponse.json({
          error: "Tabelas de torneios não estão criadas no banco de dados",
          details: "Você precisa aplicar a migration Supabase",
          instrucoes: "1. Vá para https://app.supabase.com/project/yxbrnfcvmkctrcgexmld/sql/new\n2. Copie o conteúdo do arquivo supabase/migrations/20261118000013_torneios.sql\n3. Cole no editor SQL e execute\n4. Volte e tente criar o torneio novamente"
        }, { status: 500 });
      }

      return NextResponse.json({
        error: "Erro ao criar torneio",
        details: mensagemErro
      }, { status: 500 });
    }

    // Criar fases/grupos automaticamente
    if (formato === "grupos" || formato === "grupos_eliminatoria") {
      const fases = [];
      for (let i = 1; i <= (num_grupos || 2); i++) {
        fases.push({
          torneio_id: torneio.id,
          nome: `Grupo ${String.fromCharCode(64 + i)}`,
          tipo: "grupo",
          numero_grupo: i,
          estado: "planejamento",
        });
      }

      const { error: erroFases, data: fasesCriadas } = await supabase
        .from("fases_torneio" as any)
        .insert(fases as any)
        .select();

      if (erroFases) {
        console.error("Erro ao criar fases:", erroFases?.message || erroFases);
        // Mesmo com erro nas fases, o torneio foi criado, então retorna o torneio
        // e o usuário pode adicionar as fases manualmente
      } else {
        console.log(`Fases criadas com sucesso: ${fasesCriadas?.length || 0} fases`);
      }
    }

    return NextResponse.json({ id: torneio.id, torneio });
  } catch (erro) {
    console.error("Erro na API de torneios:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
