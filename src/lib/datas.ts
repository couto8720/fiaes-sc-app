// Conversão entre a hora de Lisboa (o que o staff escreve no formulário) e UTC (o que fica na BD).
// Sem dependências, para poder ser testado diretamente com o Node (tests/validacao.test.ts).

const FUSO = "Europe/Lisbon";

const partes = new Intl.DateTimeFormat("en-US", {
  timeZone: FUSO,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/** Diferença (em minutos) entre a hora de Lisboa e UTC num dado instante: 0 no inverno, 60 no verão. */
function desvioMinutos(utcMs: number) {
  const p = partes.formatToParts(new Date(utcMs));
  const g = (t: string) => Number(p.find((x) => x.type === t)?.value);
  const comoUtc = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second"));
  return Math.round((comoUtc - utcMs) / 60_000);
}

/** "2026-11-01" + "15:00" (hora de Lisboa) → ISO em UTC. null se a data/hora for inválida. */
export function lisboaParaISO(data: string, hora: string): string | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
  const h = /^(\d{2}):(\d{2})$/.exec(hora);
  if (!d || !h) return null;
  const [ano, mes, dia, hh, mm] = [d[1], d[2], d[3], h[1], h[2]].map(Number);
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31 || hh > 23 || mm > 59) return null;

  const base = Date.UTC(ano, mes - 1, dia, hh, mm);
  if (new Date(base).getUTCDate() !== dia) return null; // ex.: 31 de fevereiro

  // Duas iterações chegam para acertar o desvio mesmo perto da mudança de hora.
  let t = base - desvioMinutos(base) * 60_000;
  t = base - desvioMinutos(t) * 60_000;
  return new Date(t).toISOString();
}

/** "2026-10-31" + 1 → "2026-11-01" (aritmética de calendário, sem fusos). */
export function somarDias(chave: string, dias: number) {
  const [a, m, d] = chave.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

/** Fim de semana mais recente (sábado e domingo) até ao dia indicado, inclusive. */
export function fimDeSemanaAte(chaveHoje: string) {
  const [a, m, d] = chaveHoje.split("-").map(Number);
  const diaSemana = new Date(Date.UTC(a, m - 1, d)).getUTCDay(); // 0 = domingo, 6 = sábado
  const recuar = (diaSemana + 1) % 7; // dias desde o último sábado
  const de = somarDias(chaveHoje, -recuar);
  return { de, ate: somarDias(de, 1) };
}

/** [início, fim) em UTC para os dias de Lisboa de "de" a "ate" (inclusive). */
export function intervaloUTC(de: string, ate: string) {
  return { desde: lisboaParaISO(de, "00:00"), ateExclusivo: lisboaParaISO(somarDias(ate, 1), "00:00") };
}

const MESES = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];

/** "25–26 out. 2026" ou "31 out. – 1 nov. 2026" */
export function formatarIntervalo(de: string, ate: string) {
  const [a1, m1, d1] = de.split("-").map(Number);
  const [a2, m2, d2] = ate.split("-").map(Number);
  if (de === ate) return `${d1} ${MESES[m1 - 1]} ${a1}`;
  if (a1 === a2 && m1 === m2) return `${d1}–${d2} ${MESES[m1 - 1]} ${a1}`;
  if (a1 === a2) return `${d1} ${MESES[m1 - 1]} – ${d2} ${MESES[m2 - 1]} ${a1}`;
  return `${d1} ${MESES[m1 - 1]} ${a1} – ${d2} ${MESES[m2 - 1]} ${a2}`;
}

const fmtData = new Intl.DateTimeFormat("en-CA", { timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit" });
const fmtHora = new Intl.DateTimeFormat("en-GB", { timeZone: FUSO, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

/** ISO em UTC → { data: "2026-11-01", hora: "15:00" } na hora de Lisboa (para preencher o formulário). */
export function isoParaLisboa(iso: string) {
  const d = new Date(iso);
  return { data: fmtData.format(d), hora: fmtHora.format(d) };
}
