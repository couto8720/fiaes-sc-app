"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Campo, BotaoSubmeter } from "@/components/admin/ui";

interface Fase {
  id: string;
  nome: string;
}

interface Escalao {
  id: string;
  nome: string;
}

export function FormularioNovaEquipa({
  torneioId,
  fases,
  escaloes,
}: {
  torneioId: string;
  fases: Fase[];
  escaloes: Escalao[];
}) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const [form, setForm] = useState({
    nome: "",
    escalao_id: "",
    fase_torneio_id: fases[0]?.id || "",
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    try {
      if (!form.nome.trim()) {
        throw new Error("Nome da equipa é obrigatório");
      }

      if (!form.fase_torneio_id) {
        throw new Error("Fase do torneio é obrigatória");
      }

      const res = await fetch(`/api/torneios/${torneioId}/equipas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(),
          escalao_id: form.escalao_id || null,
          fase_torneio_id: form.fase_torneio_id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar equipa");
      }

      router.push(`/admin/torneios/${torneioId}`);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-borda bg-superficie p-6">
      {erro && (
        <p className="rounded-xl bg-derrota/10 px-4 py-3 text-sm font-medium text-derrota">
          ❌ {erro}
        </p>
      )}

      <Campo rotulo="Nome da Equipa" nome="nome" ajuda="Ex: Académica A, União Desportiva B">
        <input
          type="text"
          name="nome"
          className="h-12 w-full rounded-xl border border-borda bg-fundo px-3 outline-none focus:border-clube focus:ring-2 focus:ring-clube/30"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          required
        />
      </Campo>

      {fases.length > 0 && (
        <Campo rotulo="Fase/Grupo" nome="fase">
          <select
            value={form.fase_torneio_id}
            onChange={(e) => setForm({ ...form, fase_torneio_id: e.target.value })}
            className="h-12 w-full rounded-xl border border-borda bg-fundo px-3 outline-none focus:border-clube focus:ring-2 focus:ring-clube/30"
          >
            {fases.map((fase) => (
              <option key={fase.id} value={fase.id}>
                {fase.nome}
              </option>
            ))}
          </select>
        </Campo>
      )}

      {escaloes.length > 0 && (
        <Campo rotulo="Escalão" nome="escalao" ajuda="Opcional">
          <select
            value={form.escalao_id}
            onChange={(e) => setForm({ ...form, escalao_id: e.target.value })}
            className="h-12 w-full rounded-xl border border-borda bg-fundo px-3 outline-none focus:border-clube focus:ring-2 focus:ring-clube/30"
          >
            <option value="">Sem escalão</option>
            {escaloes.map((escalao) => (
              <option key={escalao.id} value={escalao.id}>
                {escalao.nome}
              </option>
            ))}
          </select>
        </Campo>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-xl border border-borda px-4 py-3 font-semibold transition-opacity hover:opacity-80"
        >
          Cancelar
        </button>
        <div className="flex-1">
          <BotaoSubmeter disabled={carregando}>Adicionar Equipa</BotaoSubmeter>
        </div>
      </div>
    </form>
  );
}
