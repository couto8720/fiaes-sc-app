"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Campo, BotaoSubmeter } from "@/components/admin/ui";

interface Fase {
  id: string;
  nome: string;
  numero_grupo?: number;
}

interface Equipa {
  id: string;
  nome: string;
  fase_torneio_id: string;
  fase_torneio?: { id: string; nome: string } | null;
}

interface GerenciadorEquipasProps {
  torneioId: string;
  torneio: any;
  fases: Fase[];
  equipasIniciais: Equipa[];
}

export function GerenciadorEquipas({
  torneioId,
  torneio,
  fases,
  equipasIniciais
}: GerenciadorEquipasProps) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [equipas, setEquipas] = useState<Equipa[]>(equipasIniciais);
  const [novaEquipa, setNovaEquipa] = useState("");
  const [equipaParaTrocar, setEquipaParaTrocar] = useState<string | null>(null);
  const [novaFaseId, setNovaFaseId] = useState<string>("");

  const equipasPorGrupo = fases.map((fase) => ({
    fase,
    equipas: equipas.filter((e) => e.fase_torneio_id === fase.id),
  }));

  async function adicionarEquipa() {
    if (!novaEquipa.trim()) {
      setErro("Nome da equipa é obrigatório");
      return;
    }

    if (!fases.length) {
      setErro("Nenhum grupo disponível");
      return;
    }

    setCarregando(true);
    setErro("");

    try {
      const res = await fetch(`/api/torneios/${torneioId}/equipas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: novaEquipa.trim(),
          fase_torneio_id: fases[0].id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao adicionar equipa");
      }

      const data = await res.json();
      const novaEquipaCom = {
        ...data.equipa,
        fase_torneio: fases[0] ? { id: fases[0].id, nome: fases[0].nome } : null,
      };
      setEquipas([...equipas, novaEquipaCom]);
      setNovaEquipa("");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setCarregando(false);
    }
  }

  async function removerEquipa(equipaId: string) {
    setCarregando(true);
    setErro("");

    try {
      const res = await fetch(`/api/torneios/${torneioId}/equipas/${equipaId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao remover equipa");
      }

      setEquipas(equipas.filter((e) => e.id !== equipaId));
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setCarregando(false);
    }
  }

  async function trocarEquipaDeGrupo() {
    if (!equipaParaTrocar || !novaFaseId) {
      setErro("Selecione uma equipa e um novo grupo");
      return;
    }

    setCarregando(true);
    setErro("");

    try {
      const res = await fetch(`/api/torneios/${torneioId}/equipas/${equipaParaTrocar}/grupo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fase_torneio_id: novaFaseId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao trocar grupo");
      }

      const novaFaseNome = fases.find(f => f.id === novaFaseId)?.nome || "Sem grupo";
      setEquipas(
        equipas.map((e) =>
          e.id === equipaParaTrocar
            ? { ...e, fase_torneio_id: novaFaseId, fase_torneio: { id: novaFaseId, nome: novaFaseNome } }
            : e
        )
      );
      setEquipaParaTrocar(null);
      setNovaFaseId("");
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setCarregando(false);
    }
  }

  async function distribuirAutomaticamente() {
    setCarregando(true);
    setErro("");

    try {
      const res = await fetch(`/api/torneios/${torneioId}/equipas/distribuir`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao distribuir");
      }

      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="space-y-6">
      {erro && (
        <p className="rounded-xl bg-derrota/10 px-4 py-3 text-sm font-medium text-derrota">
          ❌ {erro}
        </p>
      )}

      {/* Adicionar Equipa */}
      <div className="rounded-2xl border border-borda bg-superficie p-6">
        <h2 className="mb-4 text-xl font-bold">Adicionar Equipa</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Nome da equipa..."
            className="flex-1 h-12 rounded-xl border border-borda bg-fundo px-3 outline-none focus:border-clube focus:ring-2 focus:ring-clube/30"
            value={novaEquipa}
            onChange={(e) => setNovaEquipa(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") adicionarEquipa();
            }}
          />
          <button
            onClick={adicionarEquipa}
            disabled={carregando}
            className="rounded-xl bg-clube px-6 font-semibold text-clube-texto transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            + Adicionar
          </button>
        </div>
      </div>

      {/* Distribuição */}
      <div className="rounded-2xl border border-borda bg-superficie p-6">
        <h2 className="mb-4 text-xl font-bold">Distribuição de Equipas</h2>
        <button
          onClick={distribuirAutomaticamente}
          disabled={carregando}
          className="mb-4 rounded-xl bg-clube px-6 py-3 font-semibold text-clube-texto transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          🔀 Distribuir Automaticamente
        </button>
        <p className="text-sm text-suave">
          Distribui as equipas de forma automática e equilibrada pelos grupos
        </p>
      </div>

      {/* Trocar Equipa de Grupo */}
      {equipas.length > 0 && (
        <div className="rounded-2xl border border-borda bg-superficie p-6">
          <h2 className="mb-4 text-xl font-bold">Trocar Equipa de Grupo</h2>
          <div className="space-y-3">
            <label className="space-y-1">
              <span className="text-sm font-medium">Equipa</span>
              <select
                className="h-12 w-full rounded-xl border border-borda bg-fundo px-3 outline-none focus:border-clube focus:ring-2 focus:ring-clube/30"
                value={equipaParaTrocar || ""}
                onChange={(e) => setEquipaParaTrocar(e.target.value || null)}
              >
                <option value="">Selecione uma equipa...</option>
                {equipas.map((equipa) => (
                  <option key={equipa.id} value={equipa.id}>
                    {equipa.nome} ({equipa.fase_torneio?.nome || "Sem grupo"})
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Novo Grupo</span>
              <select
                className="h-12 w-full rounded-xl border border-borda bg-fundo px-3 outline-none focus:border-clube focus:ring-2 focus:ring-clube/30"
                value={novaFaseId}
                onChange={(e) => setNovaFaseId(e.target.value)}
              >
                <option value="">Selecione um grupo...</option>
                {fases.map((fase) => (
                  <option key={fase.id} value={fase.id}>
                    {fase.nome}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={trocarEquipaDeGrupo}
              disabled={carregando || !equipaParaTrocar || !novaFaseId}
              className="w-full rounded-xl bg-clube px-4 py-3 font-semibold text-clube-texto transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              ↔️ Trocar Grupo
            </button>
          </div>
        </div>
      )}

      {/* Lista de Equipas por Grupo */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Equipas por Grupo</h2>
        {equipasPorGrupo.map(({ fase, equipas: equipasDaFase }) => (
          <div key={fase.id} className="rounded-xl border border-borda bg-superficie p-4">
            <h3 className="mb-3 font-bold">{fase.nome}</h3>
            {equipasDaFase.length > 0 ? (
              <div className="space-y-2">
                {equipasDaFase.map((equipa) => (
                  <div
                    key={equipa.id}
                    className="flex items-center justify-between rounded-lg bg-fundo p-3"
                  >
                    <span>{equipa.nome}</span>
                    <button
                      onClick={() => removerEquipa(equipa.id)}
                      disabled={carregando}
                      className="rounded-lg bg-derrota/10 px-3 py-1 text-sm font-semibold text-derrota transition-opacity hover:opacity-80 disabled:opacity-50"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-suave">Sem equipas neste grupo</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
