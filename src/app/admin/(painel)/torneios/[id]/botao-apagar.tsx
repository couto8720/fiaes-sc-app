"use client";

import { useState } from "react";

export function BotaoApagarTorneio({ torneioId }: { torneioId: string }) {
  const [confirmacao, setConfirmacao] = useState(false);
  const [apagando, setApagando] = useState(false);

  async function apagarTorneio() {
    setApagando(true);
    try {
      const res = await fetch(`/api/torneios/${torneioId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao apagar torneio");
      window.location.href = "/admin/torneios";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro desconhecido");
      setApagando(false);
      setConfirmacao(false);
    }
  }

  if (confirmacao) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-lg border border-borda bg-fundo p-6 shadow-lg max-w-sm mx-4">
          <h3 className="text-lg font-bold mb-2">Apagar Torneio?</h3>
          <p className="text-sm text-suave mb-6">
            Tem certeza que deseja apagar este torneio? Esta ação não pode ser desfeita e todos os dados associados serão removidos.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmacao(false)}
              disabled={apagando}
              className="flex-1 rounded-lg border border-borda px-4 py-2 font-semibold transition-colors hover:bg-corpo/5 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={apagarTorneio}
              disabled={apagando}
              className="flex-1 rounded-lg bg-derrota px-4 py-2 font-semibold text-derrota-texto transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              {apagando ? "Apagando..." : "Apagar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirmacao(true)}
      className="rounded-xl bg-derrota px-5 py-3 font-semibold text-derrota-texto transition-opacity hover:opacity-80"
    >
      🗑️ Apagar
    </button>
  );
}
