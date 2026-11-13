// Mapa dentro da app: converte o link do Google Maps de um local num mapa embutido (sem chave de API).
// Funções puras, testadas em tests/mapa.test.ts.

/** O que procurar no mapa: o "query"/"q" do link do Google Maps, ou o nome do local. */
export function pesquisaDoMapa(mapsUrl: string | null | undefined, nomeLocal: string): string {
  try {
    const u = new URL(mapsUrl ?? "");
    const q = u.searchParams.get("query") ?? u.searchParams.get("q");
    if (q?.trim()) return q.trim();
  } catch {
    // link inválido ou vazio: usa o nome
  }
  return nomeLocal.trim();
}

/** Endereço do mapa para pôr numa janela (iframe) dentro da app. Com chave: usa a API oficial (melhor qualidade). Sem chave: usa o formulário do Google Maps. */
export function urlMapaEmbutido(mapsUrl: string | null | undefined, nomeLocal: string, chaveAPI?: string): string {
  const pesquisa = pesquisaDoMapa(mapsUrl, nomeLocal);
  if (chaveAPI?.trim()) {
    return `https://www.google.com/maps/embed/v1/search?key=${encodeURIComponent(chaveAPI)}&q=${encodeURIComponent(pesquisa)}`;
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(pesquisa)}&output=embed`;
}

/** Link para abrir o Google Maps (direções): só aceita http/https. */
export function linkSeguro(mapsUrl: string | null | undefined, nomeLocal: string): string {
  try {
    const u = new URL(mapsUrl ?? "");
    if (u.protocol === "https:" || u.protocol === "http:") return u.toString();
  } catch {}
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nomeLocal)}`;
}
