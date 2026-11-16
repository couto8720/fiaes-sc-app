"use client";

import { useState } from "react";
import type { Escalao } from "@/lib/supabase/database.types";

type ImportType = "jogos" | "classificacao" | "resultados";

interface DadosImportados {
  tipo: ImportType;
  dados: Array<Record<string, unknown>>;
  dataImportacao: string;
}

export function ZeroZeroImporter({ escaloes }: { escaloes: Escalao[] }) {
  const [escalaoSelecionado, setEscalaoSelecionado] = useState(escaloes[0]?.id || "");
  const [importType, setImportType] = useState<ImportType>("jogos");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [dadosImportados, setDadosImportados] = useState<DadosImportados | null>(null);

  const importarDados = async () => {
    if (!escalaoSelecionado) {
      setErro("Selecione um escalão");
      return;
    }

    setCarregando(true);
    setErro("");
    setSucesso("");

    try {
      const response = await fetch("/api/admin/zerozero/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          escalaoId: escalaoSelecionado,
          tipo: importType,
        }),
      });

      if (!response.ok) {
        throw new Error((await response.json()).message || "Erro ao importar dados");
      }

      const dados = await response.json();
      setDadosImportados({
        tipo: importType,
        dados: dados.jogos || dados.classificacao || [],
        dataImportacao: new Date().toLocaleString("pt-PT"),
      });

      setSucesso(`${dados.total || 0} registros importados com sucesso!`);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setCarregando(false);
    }
  };

  const salvarDados = async () => {
    if (!dadosImportados) return;

    setCarregando(true);
    setErro("");

    try {
      const response = await fetch("/api/admin/zerozero/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          escalaoId: escalaoSelecionado,
          tipo: dadosImportados.tipo,
          dados: dadosImportados.dados,
        }),
      });

      if (!response.ok) {
        throw new Error((await response.json()).message || "Erro ao salvar dados");
      }

      setSucesso("Dados salvos com sucesso!");
      setDadosImportados(null);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar dados");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="rounded-xl border border-borda bg-superficie p-6 space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-4">Importador ZeroZero</h2>

        {/* Seleção de Escalão */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Escalão</label>
          <select
            value={escalaoSelecionado}
            onChange={(e) => setEscalaoSelecionado(e.target.value)}
            className="w-full rounded-lg border border-borda bg-superficie px-3 py-2"
          >
            {escaloes.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de Importação */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Tipo de Importação</label>
          <div className="grid grid-cols-3 gap-2">
            {(["jogos", "classificacao", "resultados"] as const).map((tipo) => (
              <button
                key={tipo}
                onClick={() => setImportType(tipo)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  importType === tipo
                    ? "bg-clube text-clube-texto"
                    : "border border-borda bg-superficie hover:bg-borda"
                }`}
              >
                {tipo === "jogos" && "🎮 Jogos"}
                {tipo === "classificacao" && "📊 Classificação"}
                {tipo === "resultados" && "⚽ Resultados"}
              </button>
            ))}
          </div>
        </div>

        {/* Mensagens */}
        {erro && (
          <div className="mb-4 rounded-lg bg-derrota/10 px-4 py-2 text-derrota text-sm">
            {erro}
          </div>
        )}
        {sucesso && (
          <div className="mb-4 rounded-lg bg-vitoria/10 px-4 py-2 text-vitoria text-sm">
            {sucesso}
          </div>
        )}

        {/* Botão Importar */}
        <div className="mb-4">
          <button
            onClick={importarDados}
            disabled={carregando}
            className="w-full rounded-lg bg-clube px-4 py-2 font-semibold text-clube-texto transition hover:opacity-90 disabled:opacity-50"
          >
            {carregando ? "Importando..." : "🔄 Importar do ZeroZero"}
          </button>
        </div>

        {/* Preview dos Dados */}
        {dadosImportados && (
          <div className="border-t border-borda pt-4">
            <h3 className="font-semibold mb-3">
              Preview: {dadosImportados.dados.length} registros
            </h3>
            <div className="max-h-64 overflow-y-auto mb-4 rounded-lg border border-borda p-3 bg-fundo text-sm">
              <pre className="whitespace-pre-wrap break-words">
                {JSON.stringify(dadosImportados.dados.slice(0, 3), null, 2)}
              </pre>
              {dadosImportados.dados.length > 3 && (
                <p className="text-suave text-xs mt-2">
                  ... e mais {dadosImportados.dados.length - 3} registros
                </p>
              )}
            </div>

            {/* Botões Salvar/Cancelar */}
            <div className="flex gap-2">
              <button
                onClick={salvarDados}
                disabled={carregando}
                className="flex-1 rounded-lg bg-vitoria px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                ✓ Salvar Dados
              </button>
              <button
                onClick={() => setDadosImportados(null)}
                disabled={carregando}
                className="flex-1 rounded-lg border border-borda px-4 py-2 font-semibold transition hover:bg-borda"
              >
                ✕ Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
