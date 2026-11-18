"use client";

export function BotaoApagarTorneio({ torneioId }: { torneioId: string }) {
  async function apagarTorneio() {
    if (!confirm("Tem certeza que deseja apagar este torneio? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      const res = await fetch(`/api/torneios/${torneioId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao apagar torneio");

      window.location.href = "/admin/torneios";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro desconhecido");
    }
  }

  return (
    <button
      onClick={apagarTorneio}
      className="rounded-xl bg-derrota px-5 py-3 font-semibold text-derrota-texto transition-opacity hover:opacity-80"
    >
      🗑️ Apagar
    </button>
  );
}
