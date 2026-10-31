// Dados de demonstração, usados quando o Supabase ainda não está configurado.
// Espelham supabase/seed.sql; as datas são relativas ao momento do pedido.
import type { Classificacao, ClubeConfig, Escalao, Local } from "./supabase/database.types";
import type { JogoCompleto } from "./dados";

export const CONFIG_DEMO: ClubeConfig = {
  id: true,
  nome: "Fiães Sport Clube",
  nome_curto: "Fiães SC",
  logo_url: null,
  cor_primaria: "#006633",
  cor_secundaria: "#FFFFFF",
  cor_destaque: "#FFCC00",
  hashtag: "#FiaesSC",
};

const esc = (id: string, nome: string, slug: string, ordem: number, competicao: string): Escalao => ({
  id, nome, slug, ordem, epoca: "2026/27", competicao, ativo: true,
});

export const ESCALOES_DEMO: Escalao[] = [
  esc("e13", "Sub-13", "sub-13", 1, "Distrital Sub-13 — Série B"),
  esc("e15", "Sub-15", "sub-15", 2, "Distrital Sub-15 — Série A"),
  esc("e17", "Sub-17", "sub-17", 3, "Distrital Sub-17 — Série A"),
  esc("e99", "Seniores", "seniores", 4, "1.ª Divisão Distrital"),
];

const LOCAIS: Record<string, Local> = {
  casa: { id: "l1", nome: "Campo do Fiães SC", morada: "Fiães", maps_url: "https://maps.google.com/?q=Fi%C3%A3es+Sport+Clube" },
  norte: { id: "l2", nome: "Campo Municipal Norte", morada: "Avenida Norte, 200", maps_url: "https://maps.google.com/?q=Campo+Municipal+Norte" },
  sul: { id: "l3", nome: "Complexo Desportivo Sul", morada: "Estrada Sul, km 3", maps_url: "https://maps.google.com/?q=Complexo+Desportivo+Sul" },
};

const g = (marcador: string, minuto: number, penalti = false) => ({ marcador, minuto, penalti });

const MIN = 60_000;
const HORA = 60 * MIN;
const DIA = 24 * HORA;

export function jogosDemo(agora: number): JogoCompleto[] {
  let n = 0;
  const jogo = (
    escalaoId: string,
    deslocamento: number,
    local: keyof typeof LOCAIS,
    emCasa: boolean,
    adversario: string,
    extra: Partial<JogoCompleto> = {},
  ): JogoCompleto => {
    const e = ESCALOES_DEMO.find((x) => x.id === escalaoId)!;
    const quando = new Date(agora + deslocamento).toISOString();
    return {
      id: `demo-${++n}`,
      escalao_id: escalaoId,
      competicao: null,
      jornada: 6,
      data_hora: quando,
      local_id: LOCAIS[local].id,
      em_casa: emCasa,
      adversario,
      adversario_logo_url: null,
      golos_clube: null,
      golos_adversario: null,
      estado: "agendado",
      estado_desde: quando,
      notas: null,
      atualizado_por: null,
      atualizado_em: quando,
      escalao: { nome: e.nome, slug: e.slug, ordem: e.ordem },
      local: { nome: LOCAIS[local].nome, maps_url: LOCAIS[local].maps_url },
      golos: [],
      ...extra,
    };
  };

  return [
    jogo("e13", -7 * DIA, "casa", true, "Atlético Vale", { jornada: 5, golos_clube: 3, golos_adversario: 1, estado: "final", golos: [g("Tiago C.", 12), g("Tiago C.", 40), g("Rui P.", 55, true)] }),
    jogo("e15", -7 * DIA - 2 * HORA, "norte", false, "União da Serra", { jornada: 5, golos_clube: 0, golos_adversario: 2, estado: "final" }),
    jogo("e17", -6 * DIA, "casa", true, "Sporting Rio", { jornada: 5, golos_clube: 2, golos_adversario: 2, estado: "final", golos: [g("André S.", 23), g("Diogo F.", 78)] }),
    jogo("e99", -6 * DIA - 3 * HORA, "sul", false, "Vizinhos AD", { jornada: 5, golos_clube: 1, golos_adversario: 0, estado: "final", golos: [g("Hugo A.", 88)] }),
    jogo("e15", -50 * MIN, "casa", true, "Outro SC", {
      golos_clube: 2, golos_adversario: 1, estado: "segunda_parte", golos: [g("Gonçalo R.", 18), g("Martim L.", 51)],
      estado_desde: new Date(agora - 12 * MIN).toISOString(),
    }),
    jogo("e99", 3 * HORA, "casa", true, "Desportivo Leste"),
    jogo("e13", DIA, "norte", false, "Académico Norte"),
    jogo("e17", DIA + 2 * HORA, "sul", false, "Recreativo Sul", { estado: "adiado", notas: "Adiado por indisponibilidade do campo" }),
    jogo("e13", 8 * DIA, "casa", true, "Benfica Aldeia", { competicao: "Taça Distrital", jornada: null }),
  ];
}

const linha = (
  escalao_id: string, posicao: number, equipa: string,
  [jogos, vitorias, empates, derrotas, golos_marcados, golos_sofridos, pontos]: number[],
): Classificacao => ({
  id: `${escalao_id}-${posicao}`, escalao_id, posicao, equipa, e_o_clube: equipa === "Fiães SC",
  jogos, vitorias, empates, derrotas, golos_marcados, golos_sofridos, pontos,
  atualizado_em: "2026-10-27T10:00:00Z",
});

export const CLASSIFICACOES_DEMO: Classificacao[] = [
  linha("e13", 1, "Fiães SC", [5, 4, 1, 0, 14, 4, 13]),
  linha("e13", 2, "Académico Norte", [5, 4, 0, 1, 11, 5, 12]),
  linha("e13", 3, "Atlético Vale", [5, 2, 1, 2, 8, 9, 7]),
  linha("e15", 1, "União da Serra", [5, 5, 0, 0, 16, 2, 15]),
  linha("e15", 2, "Outro SC", [5, 3, 1, 1, 9, 6, 10]),
  linha("e15", 3, "Fiães SC", [5, 3, 0, 2, 10, 7, 9]),
  linha("e17", 1, "Sporting Rio", [5, 3, 2, 0, 12, 5, 11]),
  linha("e17", 2, "Fiães SC", [5, 3, 1, 1, 9, 6, 10]),
  linha("e99", 1, "Vizinhos AD", [5, 3, 1, 1, 8, 4, 10]),
  linha("e99", 2, "Fiães SC", [5, 3, 0, 2, 7, 5, 9]),
];
