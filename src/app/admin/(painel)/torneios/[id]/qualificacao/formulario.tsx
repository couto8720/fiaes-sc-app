"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Campo, BotaoSubmeter } from "@/components/admin/ui";

type TipoQualificacao = "apuramento_direto" | "disputa" | "liga_secundaria" | "eliminatoria" | "melhores_terceiros";
type CriterioSelecao = "posicao" | "melhores_terceiros" | "todos_de_posicao" | "manual";

interface Regra {
  id?: string;
  nome: string;
  descricao: string;
  tipo: TipoQualificacao;
  criterio: CriterioSelecao;
  num_equipas: number;
  posicoes: number[];
}

export function FormularioQualificacao({
  torneioId,
  regrasAtuais,
  fases,
}: {
  torneioId: string;
  regrasAtuais: any[];
  fases: any[];
}) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [regras, setRegras] = useState<Regra[]>(
    regrasAtuais.map((r) => ({
      id: r.id,
      nome: r.nome,
      descricao: r.descricao,
      tipo: r.tipo,
      criterio: r.criterio,
      num_equipas: r.num_equipas,
      posicoes: r.posicoes || [],
    }))
  );

  const [novaRegra, setNovaRegra] = useState<Regra>({
    nome: "",
    descricao: "",
    tipo: "apuramento_direto",
    criterio: "posicao",
    num_equipas: 2,
    posicoes: [1, 2],
  });

  const adicionarRegra = () => {
    if (!novaRegra.nome) {
      setErro("Nome da regra é obrigatório");
      return;
    }
    if (novaRegra.posicoes.length === 0) {
      setErro("Deve selecionar pelo menos uma posição");
      return;
    }
    setRegras([...regras, { ...novaRegra }]);
    setNovaRegra({
      nome: "",
      descricao: "",
      tipo: "apuramento_direto",
      criterio: "posicao",
      num_equipas: 2,
      posicoes: [1, 2],
    });
    setErro("");
  };

  const removerRegra = (index: number) => {
    setRegras(regras.filter((_, i) => i !== index));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    try {
      const res = await fetch(`/api/torneios/${torneioId}/qualificacao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regras }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao guardar regras");
      }

      router.push(`/admin/torneios/${torneioId}`);
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {erro && (
        <p className="rounded-xl bg-derrota/10 px-4 py-3 text-sm font-medium text-derrota">
          ❌ {erro}
        </p>
      )}

      <div className="rounded-2xl border border-borda bg-superficie p-6">
        <h2 className="mb-4 text-xl font-bold">Adicionar Regra de Qualificação</h2>

        <div className="space-y-4">
          <Campo rotulo="Nome da Regra" nome="nome">
            <input
              type="text"
              placeholder="ex: Campeões de Grupo, Liga de Ouro"
              className="h-12 w-full rounded-xl border border-borda bg-fundo px-3 outline-none focus:border-clube focus:ring-2 focus:ring-clube/30"
              value={novaRegra.nome}
              onChange={(e) => setNovaRegra({ ...novaRegra, nome: e.target.value })}
            />
          </Campo>

          <Campo rotulo="Descrição" nome="descricao" ajuda="Opcional">
            <input
              type="text"
              placeholder="ex: 1º classificado de cada grupo"
              className="h-12 w-full rounded-xl border border-borda bg-fundo px-3 outline-none focus:border-clube focus:ring-2 focus:ring-clube/30"
              value={novaRegra.descricao}
              onChange={(e) => setNovaRegra({ ...novaRegra, descricao: e.target.value })}
            />
          </Campo>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium">Tipo de Qualificação</span>
              <select
                className="h-12 w-full rounded-xl border border-borda bg-fundo px-3 outline-none focus:border-clube focus:ring-2 focus:ring-clube/30"
                value={novaRegra.tipo}
                onChange={(e) => setNovaRegra({ ...novaRegra, tipo: e.target.value as TipoQualificacao })}
              >
                <option value="apuramento_direto">📋 Apuramento Direto - Equipas vão para a próxima fase</option>
                <option value="eliminatoria">🏆 Para Eliminatória - Equipas vão para jogos eliminatórios</option>
                <option value="liga_secundaria">🥈 Liga Secundária - Equipas vão para uma liga de consolação</option>
                <option value="disputa">⚔️ Disputa - Equipas jogam uma disputa adicional</option>
                <option value="melhores_terceiros">🎯 Melhores Terceiros - Melhores 3º classificados avançam</option>
              </select>
              <p className="text-xs text-suave mt-1">
                {novaRegra.tipo === "apuramento_direto" && "Estas equipas avançam automaticamente para a próxima fase"}
                {novaRegra.tipo === "eliminatoria" && "Estas equipas vão jogar nos jogos de eliminatória (meias-finais, final, etc.)"}
                {novaRegra.tipo === "liga_secundaria" && "Estas equipas vão para uma liga secundária (ex: Liga de Prata, Liga de Bronze)"}
                {novaRegra.tipo === "disputa" && "Estas equipas vão jogar uma disputa adicional (ex: playoff)"}
                {novaRegra.tipo === "melhores_terceiros" && "Os melhores 3º classificados avançam junto com os 1º e 2º"}
              </p>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">Critério de Seleção</span>
              <select
                className="h-12 w-full rounded-xl border border-borda bg-fundo px-3 outline-none focus:border-clube focus:ring-2 focus:ring-clube/30"
                value={novaRegra.criterio}
                onChange={(e) => setNovaRegra({ ...novaRegra, criterio: e.target.value as CriterioSelecao })}
              >
                <option value="posicao">🔢 Por Posição (1º, 2º, etc.) - Especificar exatamente qual posição</option>
                <option value="melhores_terceiros">⭐ Melhores Terceiros - Automaticamente os melhores 3º</option>
                <option value="todos_de_posicao">👥 Todos de uma Posição - Todos que ficarem numa posição específica</option>
                <option value="manual">✋ Manual (Admin escolhe) - Admin seleciona manualmente as equipas</option>
              </select>
              <p className="text-xs text-suave mt-1">
                {novaRegra.criterio === "posicao" && "Ex: 1 (apenas 1º), ou 1,2 (1º e 2º)"}
                {novaRegra.criterio === "melhores_terceiros" && "O sistema calcula automaticamente os melhores 3º classificados"}
                {novaRegra.criterio === "todos_de_posicao" && "Todos que ficarem naquela posição em todos os grupos"}
                {novaRegra.criterio === "manual" && "Você escolherá manualmente as equipas após os grupos terminarem"}
              </p>
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium">Número de Equipas</span>
            <input
              type="number"
              min="1"
              className="h-12 w-full rounded-xl border border-borda bg-fundo px-3 outline-none focus:border-clube focus:ring-2 focus:ring-clube/30"
              value={novaRegra.num_equipas}
              onChange={(e) => setNovaRegra({ ...novaRegra, num_equipas: parseInt(e.target.value) })}
            />
          </label>

          {novaRegra.criterio === "posicao" && (
            <label className="space-y-2">
              <span className="text-sm font-medium">Posições (ex: 1 e 2 para 1º e 2º)</span>
              <input
                type="text"
                placeholder="1, 2"
                className="h-12 w-full rounded-xl border border-borda bg-fundo px-3 outline-none focus:border-clube focus:ring-2 focus:ring-clube/30"
                value={novaRegra.posicoes.join(", ")}
                onChange={(e) =>
                  setNovaRegra({
                    ...novaRegra,
                    posicoes: e.target.value.split(",").map((p) => parseInt(p.trim())).filter((p) => !isNaN(p)),
                  })
                }
              />
            </label>
          )}

          <button
            type="button"
            onClick={adicionarRegra}
            className="w-full rounded-xl bg-clube px-4 py-3 font-semibold text-clube-texto transition-opacity hover:opacity-80"
          >
            + Adicionar Regra
          </button>
        </div>
      </div>

      {regras.length > 0 && (
        <div className="rounded-2xl border border-borda bg-superficie p-6">
          <h2 className="mb-4 text-xl font-bold">Regras Configuradas ({regras.length})</h2>
          <div className="space-y-3">
            {regras.map((regra, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-xl border border-borda p-4">
                <div>
                  <p className="font-semibold">{regra.nome}</p>
                  {regra.descricao && <p className="text-sm text-suave">{regra.descricao}</p>}
                  <p className="text-xs text-suave mt-1">
                    {regra.num_equipas} equipas • {regra.tipo.replace("_", " ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removerRegra(idx)}
                  className="rounded-lg bg-derrota/10 px-3 py-2 text-sm font-semibold text-derrota transition-opacity hover:opacity-80"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        </div>
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
          <BotaoSubmeter disabled={regras.length === 0}>Guardar Regras</BotaoSubmeter>
        </div>
      </div>
    </form>
  );
}
