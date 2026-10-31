import type { EstadoJogo as Estado } from "@/lib/supabase/database.types";
import { ROTULO_ESTADO, aoVivo, type Desfecho } from "@/lib/jogos";
import { TempoDesde } from "./TempoDesde";

const ROTULO_DESFECHO = { vitoria: "V", empate: "E", derrota: "D" } as const;
const COR_DESFECHO = { vitoria: "bg-vitoria", empate: "bg-empate", derrota: "bg-derrota" } as const;

export function EstadoJogo({
  estado,
  desde,
  desfecho,
}: {
  estado: Estado;
  desde: string;
  desfecho?: Desfecho;
}) {
  if (aoVivo(estado)) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ao-vivo">
        <span aria-hidden className="ponto-ao-vivo h-2 w-2 rounded-full bg-ao-vivo" />
        {ROTULO_ESTADO[estado]}
        {estado !== "intervalo" && (
          <span className="font-medium normal-case text-suave">
            · <TempoDesde desde={desde} />
          </span>
        )}
      </span>
    );
  }

  if (estado === "final" && desfecho) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-suave">
        <span
          className={`grid h-5 w-5 place-items-center rounded text-[11px] font-black text-white ${COR_DESFECHO[desfecho]}`}
          title={desfecho === "vitoria" ? "Vitória" : desfecho === "empate" ? "Empate" : "Derrota"}
        >
          {ROTULO_DESFECHO[desfecho]}
        </span>
        Final
      </span>
    );
  }

  if (estado === "adiado" || estado === "cancelado") {
    return (
      <span className="rounded bg-borda px-2 py-0.5 text-xs font-semibold uppercase text-suave">
        {ROTULO_ESTADO[estado]}
      </span>
    );
  }

  return null;
}
