"use client";

import { useState } from "react";

/** Descarregar / partilhar as imagens e copiar a legenda. */
export function AcoesPost({ urls, nomes, texto }: { urls: string[]; nomes: string[]; texto: string }) {
  const [copiado, setCopiado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [aPartilhar, setAPartilhar] = useState(false);

  async function partilhar() {
    setAviso(null);
    setAPartilhar(true);
    try {
      const ficheiros = await Promise.all(
        urls.map(async (u, k) => {
          const r = await fetch(u);
          if (!r.ok) throw new Error();
          return new File([await r.blob()], nomes[k], { type: "image/png" });
        }),
      );
      if (navigator.canShare?.({ files: ficheiros })) {
        await navigator.share({ files: ficheiros, text: texto });
      } else {
        setAviso("Este browser não partilha imagens diretamente. Usa “Descarregar” e publica a partir da galeria.");
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") setAviso("Não foi possível preparar as imagens. Tenta outra vez.");
    } finally {
      setAPartilhar(false);
    }
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setAviso("Não foi possível copiar automaticamente: seleciona o texto e copia à mão.");
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={partilhar} disabled={aPartilhar} className="h-12 rounded-xl bg-clube font-semibold text-clube-texto disabled:opacity-60">
          {aPartilhar ? "A preparar…" : "Partilhar"}
        </button>
        <div className="flex flex-col gap-2">
          {urls.map((u, k) => (
            <a key={u} href={`${u}&download=1`} download={nomes[k]} className="flex h-12 items-center justify-center rounded-xl border border-borda bg-superficie font-semibold">
              Descarregar{urls.length > 1 ? ` ${k + 1}/${urls.length}` : ""}
            </a>
          ))}
        </div>
      </div>
      {aviso && <p className="rounded-xl bg-empate/10 px-4 py-3 text-sm text-empate">{aviso}</p>}

      <div className="rounded-2xl border border-borda bg-superficie p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="font-semibold">Legenda</h2>
          <button type="button" onClick={copiar} className="h-9 rounded-lg border border-borda px-3 text-sm font-semibold">
            {copiado ? "✓ Copiada" : "Copiar texto"}
          </button>
        </div>
        <textarea readOnly value={texto} rows={Math.min(14, texto.split("\n").length + 1)} onFocus={(e) => e.currentTarget.select()} className="w-full resize-none rounded-xl bg-fundo p-3 text-sm outline-none" />
      </div>
    </div>
  );
}
