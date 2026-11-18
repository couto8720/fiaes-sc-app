"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Campo, BotaoSubmeter } from "@/components/admin/ui";

type FormatoTorneio = "grupos" | "eliminatoria" | "grupos_eliminatoria" | "suico";

export function FormularioEditarTorneio({ torneio }: { torneio: any }) {
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
