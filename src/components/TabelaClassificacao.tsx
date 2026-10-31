import type { Classificacao } from "@/lib/supabase/database.types";
import { formatarDiaCurto } from "@/lib/jogos";

export function TabelaClassificacao({ linhas }: { linhas: Classificacao[] }) {
  if (linhas.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-borda p-6 text-center text-suave">
        A classificação ainda não foi publicada.
      </p>
    );
  }

  const ultima = linhas.reduce((m, l) => (l.atualizado_em > m ? l.atualizado_em : m), linhas[0].atualizado_em);
  const extra = "hidden sm:table-cell";

  return (
    <div className="overflow-hidden rounded-xl border border-borda bg-superficie shadow-sm">
      <table className="tabular w-full text-sm">
        <thead className="bg-fundo text-xs uppercase text-suave">
          <tr>
            <th scope="col" className="w-10 py-2 pl-3 text-left" title="Posição">#</th>
            <th scope="col" className="py-2 text-left">Equipa</th>
            <th scope="col" className="w-9 py-2 text-center" title="Jogos">J</th>
            <th scope="col" className={`w-9 py-2 text-center ${extra}`} title="Vitórias">V</th>
            <th scope="col" className={`w-9 py-2 text-center ${extra}`} title="Empates">E</th>
            <th scope="col" className={`w-9 py-2 text-center ${extra}`} title="Derrotas">D</th>
            <th scope="col" className={`w-14 py-2 text-center ${extra}`} title="Golos marcados e sofridos">G</th>
            <th scope="col" className="w-10 py-2 text-center" title="Diferença de golos">DG</th>
            <th scope="col" className="w-12 py-2 pr-3 text-center" title="Pontos">Pts</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => {
            const dg = l.golos_marcados - l.golos_sofridos;
            return (
              <tr
                key={l.id}
                aria-current={l.e_o_clube ? "true" : undefined}
                className={`border-t border-borda ${l.e_o_clube ? "bg-clube/10 font-bold dark:bg-destaque/10" : ""}`}
              >
                <td className="py-2.5 pl-3">{l.posicao}</td>
                <td className="max-w-0 truncate py-2.5 pr-2">{l.equipa}</td>
                <td className="text-center">{l.jogos}</td>
                <td className={`text-center ${extra}`}>{l.vitorias}</td>
                <td className={`text-center ${extra}`}>{l.empates}</td>
                <td className={`text-center ${extra}`}>{l.derrotas}</td>
                <td className={`text-center ${extra}`}>{l.golos_marcados}:{l.golos_sofridos}</td>
                <td className="text-center">{dg > 0 ? `+${dg}` : dg}</td>
                <td className="pr-3 text-center font-bold">{l.pontos}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-borda px-3 py-2 text-xs text-suave">Atualizada em {formatarDiaCurto(ultima)}</p>
    </div>
  );
}
