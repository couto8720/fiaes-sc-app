"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Campo, BotaoSubmeter } from "@/components/admin/ui";

type FormatoTorneio = "grupos" | "eliminatoria" | "grupos_eliminatoria" | "suico";

export function FormularioEditarTorneio({ torneio, regrasQualificacao }: { torneio: any; regrasQualificacao?: any[] }) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const [form, setForm] = useState({
    nome: torneio.nome || "",
    descricao: torneio.descricao || "",
    formato: torneio.formato as FormatoTorneio,
    num_grupos: torneio.num_grupos || 2,
    equipas_por_grupo: torneio.equipas_por_grupo || 4,
    avancar_por_grupo: torneio.avancar_por_grupo || 2,
    tem_terceiro_lugar: torneio.tem_terceiro_lugar || false,
    vitoria_pontos: torneio.vitoria_pontos || 3,
    empate_pontos: torneio.empate_pontos || 1,
    estado: torneio.estado || "planejamento",
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    try {
      const res = await fetch(`/api/torneios/${torneio.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao atualizar torneio");
      }

      router.push(`/admin/torneios/${torneio.id}`);
      router.refresh();
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

      <Campo rotulo="Nome do Torneio" nome="nome">
        <input
          type="text"
          name="nome"
          className="h-12 w-full rounded-xl border border-borda bg-fundo px-3 outline-none focus:border-clube focus:ring-2 focus:ring-clube/30"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          required
        />
      </Campo>

      <Campo rotulo="Descrição" nome="descricao" ajuda="Opcional">
        <textarea
          name="descricao"
          className="min-h-20 w-full rounded-xl border border-borda bg-fundo px-3 py-2 outline-none focus:border-clube focus:ring-2 focus:ring-clube/30"
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
        />
      </Campo>

      <fieldset className="space-y-3 rounded-xl border border-borda p-4">
        <legend className="font-semibold">Estado</legend>
        {(["planejamento", "em_curso", "finalizado"] as const).map((estado) => (
          <label key={estado} className="flex items-center gap-3">
            <input
              type="radio"
              name="estado"
              value={estado}
              checked={form.estado === estado}
              onChange={() => setForm({ ...form, estado })}
            />
            <span className="capitalize">{estado.replace("_", " ")}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-borda p-4">
        <legend className="font-semibold">Formato</legend>
        {(["grupos", "eliminatoria", "grupos_eliminatoria", "suico"] as const).map((fmt) => (
          <label key={fmt} className="flex items-center gap-3">
            <input
              type="radio"
              name="formato"
              value={fmt}
              checked={form.formato === fmt}
              onChange={() => setForm({ ...form, formato: fmt })}
            />
            <span className="capitalize">{fmt.replace("_", " ")}</span>
          </label>
        ))}
      </fieldset>

      {(form.formato === "grupos" || form.formato === "grupos_eliminatoria") && (
        <>
          <Campo rotulo="Número de Grupos" nome="num_grupos">
            <input
              type="number"
              name="num_grupos"
              min="1"
              max="8"
              className="h-12 w-full rounded-xl border border-borda bg-fundo px-3 outline-none focus:border-clube focus:ring-2 focus:ring-clube/30"
              value={form.num_grupos}
              onChange={(e) => setForm({ ...form, num_grupos: parseInt(e.target.value) })}
            />
          </Campo>

          <Campo rotulo="Equipas por Grupo" nome="equipas_por_grupo">
            <input
              type="number"
              name="equipas_por_grupo"
              min="2"
              max="10"
              className="h-12 w-full rounded-xl border border-borda bg-fundo px-3 outline-none focus:border-clube focus:ring-2 focus:ring-clube/30"
              value={form.equipas_por_grupo}
              onChange={(e) => setForm({ ...form, equipas_por_grupo: parseInt(e.target.value) })}
            />
          </Campo>

          <Campo rotulo="Avançam por Grupo" nome="avancar_por_grupo">
            <input
              type="number"
              name="avancar_por_grupo"
              min="1"
              max={form.equipas_por_grupo - 1}
              className="h-12 w-full rounded-xl border border-borda bg-fundo px-3 outline-none focus:border-clube focus:ring-2 focus:ring-clube/30"
              value={form.avancar_por_grupo}
              onChange={(e) => setForm({ ...form, avancar_por_grupo: parseInt(e.target.value) })}
            />
          </Campo>
        </>
      )}

      {(form.formato === "eliminatoria" || form.formato === "grupos_eliminatoria") && (
        <fieldset className="space-y-4 rounded-xl border border-borda p-4">
          <legend className="font-semibold">Configuração da Eliminatória</legend>

          <div className="space-y-3 rounded-lg bg-clube/5 p-3 border border-clube/10">
            <p className="text-sm font-medium text-clube mb-3">🏆 Disputas e Prêmios</p>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={form.tem_terceiro_lugar}
                onChange={(e) => setForm({ ...form, tem_terceiro_lugar: e.target.checked })}
                className="h-4 w-4 cursor-pointer rounded border border-borda bg-fundo accent-clube mt-1"
              />
              <div>
                <span className="font-medium block">🥉 Disputa de 3º e 4º Lugar</span>
                <span className="text-xs text-suave">Realiza jogo entre os perdedores das semi-finais para decidir o 3º lugar</span>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                defaultChecked={false}
                className="h-4 w-4 cursor-pointer rounded border border-borda bg-fundo accent-clube mt-1"
              />
              <div>
                <span className="font-medium block">🥉 Disputa de 5º e 6º Lugar</span>
                <span className="text-xs text-suave">Realiza jogo para definir 5º e 6º lugares (pode depender do número de equipas)</span>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                defaultChecked={false}
                className="h-4 w-4 cursor-pointer rounded border border-borda bg-fundo accent-clube mt-1"
              />
              <div>
                <span className="font-medium block">🥉 Disputa de 7º e 8º Lugar</span>
                <span className="text-xs text-suave">Realiza jogo para definir 7º e 8º lugares (apenas se houver 8 equipas)</span>
              </div>
            </label>
          </div>

          <div className="text-xs text-suave bg-suave/5 p-2 rounded border border-suave/10">
            <p>💡 <strong>Dica:</strong> O número de equipas na eliminatória é definido pelas Regras de Qualificação (quantas equipas avançam dos grupos).</p>
          </div>
        </fieldset>
      )}

      <fieldset className="space-y-3 rounded-xl border border-borda p-4">
        <legend className="font-semibold">Regras de Pontuação</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium">Vitória = pontos</span>
            <input
              type="number"
              min="0"
              max="10"
              className="h-10 w-full rounded-lg border border-borda bg-fundo px-2 outline-none focus:border-clube focus:ring-2 focus:ring-clube/30"
              value={form.vitoria_pontos}
              onChange={(e) => setForm({ ...form, vitoria_pontos: parseInt(e.target.value) })}
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Empate = pontos</span>
            <input
              type="number"
              min="0"
              max="10"
              className="h-10 w-full rounded-lg border border-borda bg-fundo px-2 outline-none focus:border-clube focus:ring-2 focus:ring-clube/30"
              value={form.empate_pontos}
              onChange={(e) => setForm({ ...form, empate_pontos: parseInt(e.target.value) })}
            />
          </label>
        </div>
      </fieldset>

      <div className="mt-6 rounded-xl border-2 border-dashed border-borda p-6">
        <h3 className="mb-3 font-semibold">Configuração de Qualificação</h3>
        <p className="mb-4 text-sm text-suave">
          Defina as regras de apuramento dos grupos para a próxima fase. Esta configuração está disponível após salvar o torneio.
        </p>
        <a
          href={`/admin/torneios/${torneio.id}/qualificacao`}
          className="inline-block rounded-xl bg-clube px-4 py-2 text-sm font-semibold text-clube-texto transition-opacity hover:opacity-80"
        >
          Configurar Regras de Qualificação →
        </a>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-xl border border-borda px-4 py-3 font-semibold transition-opacity hover:opacity-80"
        >
          Cancelar
        </button>
        <div className="flex-1">
          <BotaoSubmeter>Guardar Alterações</BotaoSubmeter>
        </div>
      </div>
    </form>
  );
}
