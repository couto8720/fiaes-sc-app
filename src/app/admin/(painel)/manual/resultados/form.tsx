"use client";

import { useState } from "react";
import type { Escalao } from "@/lib/supabase/database.types";

export function FormResultado({ escaloes }: { escaloes: Escalao[] }) {
  const [escalaoId, setEscalaoId] = useState(escaloes[0]?.id || "");
  const [adversario, setAdversario] = useState("");
  const [golosClube, setGolosClube] = useState("");
  const [golosAdversario, setGolosAdversario] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!escalaoId || !adversario || golosClube === "" || golosAdversario === "") {
      setMensagem("Preencha todos os campos");
      return;
    }

    setCarregando(true);
    setMensagem("");

    try {
      const response = await fetch("/api/admin/manual/resultado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          escalaoId,
          adversario,
          golosClube: parseInt(golosClube),
          golosAdversario: parseInt(golosAdversario),
        }),
      });

      if (!response.ok) {
        throw new Error((await response.json()).message || "Erro ao salvar");
      }

      setMensagem("✓ Resultado salvo com sucesso!");
      setAdversario("");
      setGolosClube("");
      setGolosAdversario("");

      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      setMensagem(`✗ ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-borda bg-superficie p-6 space-y-4">
      <h2 className="text-xl font-bold">Registrar Resultado Manual</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold mb-2">Escalão</label>
          <select
            value={escalaoId}
            onChange={(e) => setEscalaoId(e.target.value)}
            className="w-full rounded-lg border border-borda bg-superficie px-3 py-2"
          >
            {escaloes.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Adversário</label>
          <input
            type="text"
            value={adversario}
            onChange={(e) => setAdversario(e.target.value)}
            placeholder="Nome do adversário"
            className="w-full rounded-lg border border-borda bg-superficie px-3 py-2"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold mb-2">Golos Fiães</label>
          <input
            type="number"
            value={golosClube}
            onChange={(e) => setGolosClube(e.target.value)}
            min="0"
            className="w-full rounded-lg border border-borda bg-superficie px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Golos Adversário</label>
          <input
            type="number"
            value={golosAdversario}
            onChange={(e) => setGolosAdversario(e.target.value)}
            min="0"
            className="w-full rounded-lg border border-borda bg-superficie px-3 py-2"
          />
        </div>
      </div>

      {mensagem && (
        <div className={`rounded-lg px-4 py-2 text-sm font-semibold ${
          mensagem.startsWith("✓")
            ? "bg-vitoria/10 text-vitoria"
            : "bg-derrota/10 text-derrota"
        }`}>
          {mensagem}
        </div>
      )}

      <button
        type="submit"
        disabled={carregando}
        className="w-full rounded-lg bg-clube px-4 py-2 font-semibold text-clube-texto transition hover:opacity-90 disabled:opacity-50"
      >
        {carregando ? "Salvando..." : "✓ Salvar Resultado"}
      </button>
    </form>
  );
}
