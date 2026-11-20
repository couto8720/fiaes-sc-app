/**
 * Search and filter utilities for admin panel
 */

export interface Searchable {
  id: string;
  nome?: string;
  name?: string;
  descricao?: string;
  description?: string;
  [key: string]: any;
}

/**
 * Filter items by search query across multiple fields
 */
export function filterBySearch<T extends Searchable>(items: T[], query: string, fields?: (keyof T)[]): T[] {
  if (!query.trim()) return items;

  const lowerQuery = query.toLowerCase();
  const searchFields = fields || (["nome", "name", "descricao", "description"] as const);

  return items.filter((item) =>
    searchFields.some((field) => {
      const value = item[field];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(lowerQuery);
    })
  );
}

/**
 * Search and sort games by team names
 */
export function searchGames(
  games: any[],
  query: string,
  equipasMap: Record<string, string>
): any[] {
  if (!query.trim()) return games;

  const lowerQuery = query.toLowerCase();

  return games.filter((game) => {
    const nome1 = equipasMap[game.equipa_1_id] || "";
    const nome2 = equipasMap[game.equipa_2_id] || "";

    return (
      nome1.toLowerCase().includes(lowerQuery) ||
      nome2.toLowerCase().includes(lowerQuery) ||
      (game.local && game.local.toLowerCase().includes(lowerQuery))
    );
  });
}

/**
 * Search standings by team name
 */
export function searchStandings(standings: any[], query: string): any[] {
  if (!query.trim()) return standings;

  const lowerQuery = query.toLowerCase();

  return standings.filter((item) =>
    (item.nome || "").toLowerCase().includes(lowerQuery)
  );
}

/**
 * Highlight search terms in text
 */
export function highlightSearch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const parts = text.split(new RegExp(`(${query})`, "gi"));

  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 font-semibold">
        {part}
      </mark>
    ) : (
      part
    )
  );
}
