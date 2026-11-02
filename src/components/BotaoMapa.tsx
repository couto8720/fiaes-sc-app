"use client";

import { useRef, useState } from "react";
import { MapPin, Navigation, X } from "lucide-react";
import { linkSeguro, urlMapaEmbutido } from "@/lib/mapa";

/**
 * Botão que abre o mapa do local numa janela por cima da app (Google Maps embutido),
 * sem sair do site. Na janela há também um link para abrir o Google Maps e pedir direções.
 */
export function BotaoMapa({
  mapsUrl,
  nomeLocal,
  variante = "link",
}: {
  mapsUrl: string | null;
  nomeLocal: string;
  /** "link": pequeno, nos cartões dos jogos. "botao": grande, na página do jogo. */
  variante?: "link" | "botao";
}) {
  const janela = useRef<HTMLDialogElement>(null);
  // O mapa só é carregado quando se abre a janela (não gasta dados nas listas de jogos).
  const [aberto, setAberto] = useState(false);

  const abrir = () => {
    setAberto(true);
    janela.current?.showModal();
  };
  const fechar = () => janela.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className={
          variante === "botao"
            ? "flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-clube font-semibold text-clube-texto"
            : "relative z-10 inline-flex shrink-0 items-center gap-1 font-semibold text-clube hover:underline dark:text-destaque"
        }
      >
        {variante === "botao" ? <MapPin size={18} aria-hidden /> : <Navigation size={14} aria-hidden />}
        {variante === "botao" ? "Como chegar" : "Ver mapa"}
      </button>

      <dialog
        ref={janela}
        onClose={() => setAberto(false)}
        // Clicar fora da janela (no fundo escuro) fecha-a.
        onClick={(e) => {
          if (e.target === e.currentTarget) fechar();
        }}
        aria-label={`Mapa: ${nomeLocal}`}
        className="m-auto w-[min(100vw-2rem,42rem)] overflow-hidden rounded-2xl border border-borda bg-superficie p-0 text-texto shadow-xl backdrop:bg-black/60"
      >
        <div className="flex items-center justify-between gap-3 border-b border-borda px-4 py-3">
          <p className="flex min-w-0 items-center gap-2 font-semibold">
            <MapPin size={18} className="shrink-0 text-clube dark:text-destaque" aria-hidden />
            <span className="truncate">{nomeLocal}</span>
          </p>
          <button type="button" onClick={fechar} aria-label="Fechar mapa" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg hover:bg-borda">
            <X size={20} aria-hidden />
          </button>
        </div>
        {aberto && (
          <iframe
            src={urlMapaEmbutido(mapsUrl, nomeLocal)}
            title={`Mapa de ${nomeLocal}`}
            className="block h-[60vh] max-h-[480px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        )}
        <div className="flex justify-end px-4 py-3">
          <a
            href={linkSeguro(mapsUrl, nomeLocal)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-clube px-4 text-sm font-semibold text-clube-texto"
          >
            <Navigation size={16} aria-hidden />
            Direções no Google Maps
          </a>
        </div>
      </dialog>
    </>
  );
}
