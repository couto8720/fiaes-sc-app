// Filtro dos jogos por escalão (função pura, testada em tests/filtroJogos.test.ts).
// "" = todos; "meus" = os escalões que o adepto segue; outro valor = slug de um escalão.

export const FILTRO_MEUS = "meus";

export function filtroAtivo(filtro: string, escaloes: { slug: string }[] | undefined, meus: string[] | null): string {
  if (filtro === FILTRO_MEUS) return meus?.length ? FILTRO_MEUS : "";
  return escaloes?.some((e) => e.slug === filtro) ? filtro : "";
}

export function filtrarJogos<T extends { escalao: { slug: string } | null }>(jogos: T[], ativo: string, meus: string[] | null): T[] {
  if (!ativo) return jogos;
  if (ativo === FILTRO_MEUS) return jogos.filter((j) => j.escalao && (meus ?? []).includes(j.escalao.slug));
  return jogos.filter((j) => j.escalao?.slug === ativo);
}
