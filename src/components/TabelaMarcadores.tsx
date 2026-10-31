/** Melhores marcadores do Fiães SC num escalão (época atual). */
export function TabelaMarcadores({ linhas }: { linhas: { marcador: string; golos: number }[] }) {
  if (linhas.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-borda p-6 text-center text-suave">
        Ainda não há marcadores registados nesta época.
      </p>
    );
  }
  const max = linhas[0].golos;
  return (
    <ol className="overflow-hidden rounded-xl border border-borda bg-superficie shadow-sm">
      {linhas.map((l, k) => {
        // Empatados partilham a posição (ex.: 1, 2, 2, 4).
        const posicao = linhas.findIndex((x) => x.golos === l.golos) + 1;
        return (
          <li key={l.marcador} className={`flex items-center gap-3 px-3 py-2.5 ${k ? "border-t border-borda" : ""}`}>
            <span className="tabular w-6 text-right text-sm text-suave">{posicao}</span>
            <span className="min-w-0 flex-1 truncate font-semibold">{l.marcador}</span>
            <span className="hidden h-2 w-24 overflow-hidden rounded-full bg-borda sm:block" aria-hidden>
              <span className="block h-full rounded-full bg-clube dark:bg-destaque" style={{ width: `${(l.golos / max) * 100}%` }} />
            </span>
            <span className="tabular w-16 text-right font-bold">
              {l.golos} {l.golos === 1 ? "golo" : "golos"}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
