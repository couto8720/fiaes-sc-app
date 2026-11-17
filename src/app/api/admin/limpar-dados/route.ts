import { createClient } from "@/lib/supabase/server";
import { exigirSessao } from "@/lib/sessao";

export async function POST(request: Request) {
  try {
    const sessao = await exigirSessao();

    // Apenas super admin pode limpar dados
    if (!sessao.superAdmin) {
      return Response.json(
        { message: "Acesso negado. Apenas Super Admin." },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    // Deletar em ordem (respeitar constraints)
    // 1. Deletar marcadores (golos)
    const { error: erroGolos } = await supabase
      .from("golos")
      .delete()
      .not("jogo_id", "is", null);
    if (erroGolos) throw erroGolos;

    // 2. Deletar expulsões
    const { error: erroExpulsoes } = await supabase
      .from("expulsoes")
      .delete()
      .not("jogo_id", "is", null);
    if (erroExpulsoes) throw erroExpulsoes;

    // 3. Deletar todos os jogos
    const { error: erroJogos } = await supabase
      .from("jogos")
      .delete()
      .not("id", "is", null);
    if (erroJogos) throw erroJogos;

    return Response.json({
      success: true,
      message: "Todos os jogos, resultados e marcadores foram deletados com sucesso.",
    });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("Erro ao limpar dados:", mensagem, err);
    return Response.json(
      { message: mensagem, error: String(err) },
      { status: 500 }
    );
  }
}
