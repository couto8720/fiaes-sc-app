// Marcadores dos golos (funções puras, testadas em tests/marcadores.test.ts).

/**
 * "João Pedro Silva" → "João S." — igual à função public.abreviar_nome da BD,
 * que é quem garante a regra; esta serve para mostrar ao staff como vai ficar.
 */
export function abreviarNome(nome: string): string {
  const p = nome.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "";
  if (p.length === 1) return p[0];
  if (p.length === 2 && /^\p{L}\.$/u.test(p[1])) return `${p[0]} ${p[1].toUpperCase()}`;
  return `${p[0]} ${p[p.length - 1].charAt(0).toUpperCase()}.`;
}

export type Golo = { marcador: string; minuto: number | null; penalti: boolean };

/** "Tiago C. 12' 40', Rui P. 55' (pen.)" — agrupa por marcador, pela ordem do primeiro golo. */
export function resumoMarcadores(golos: Golo[], { minutos = true } = {}): string {
  const ordenados = [...golos].sort((a, b) => (a.minuto ?? 999) - (b.minuto ?? 999));
  const grupos = new Map<string, Golo[]>();
  for (const g of ordenados) grupos.set(g.marcador, [...(grupos.get(g.marcador) ?? []), g]);
  return [...grupos.entries()]
    .map(([nome, gs]) => {
      if (!minutos || gs.every((g) => g.minuto === null)) return gs.length > 1 ? `${nome} (${gs.length})` : nome;
      const ms = gs.map((g) => (g.minuto ? `${g.minuto}'${g.penalti ? " (pen.)" : ""}` : g.penalti ? "(pen.)" : "")).filter(Boolean);
      return `${nome} ${ms.join(" ")}`.trim();
    })
    .join(", ");
}

/** Tabela de melhores marcadores de um escalão. */
export function melhoresMarcadores(golos: Pick<Golo, "marcador">[]) {
  const contagem = new Map<string, number>();
  for (const g of golos) {
    if (g.marcador.toLowerCase() === "autogolo") continue;
    contagem.set(g.marcador, (contagem.get(g.marcador) ?? 0) + 1);
  }
  return [...contagem.entries()]
    .map(([marcador, golos]) => ({ marcador, golos }))
    .sort((a, b) => b.golos - a.golos || a.marcador.localeCompare(b.marcador, "pt"));
}

// ---------- Expulsões (cartões vermelhos) ----------

export type Expulsao = { lado: "clube" | "adversario"; atleta: string | null; minuto: number | null };

/**
 * Texto das expulsões de uma equipa, por ordem do minuto: "Rui P. 67', 80'".
 * Sem nome (adversário, ou atleta não indicado) mostra só o minuto; sem nada, "Expulsão".
 */
export function resumoExpulsoes(expulsoes: Expulsao[], lado: Expulsao["lado"]): string {
  return [...expulsoes]
    .filter((e) => e.lado === lado)
    .sort((a, b) => (a.minuto ?? 999) - (b.minuto ?? 999))
    .map((e) => [e.atleta, e.minuto && `${e.minuto}'`].filter(Boolean).join(" ") || "Expulsão")
    .join(", ");
}
