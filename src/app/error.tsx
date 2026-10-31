"use client";

// Mostrado quando a leitura dos dados falha (ex.: sem rede ou Supabase indisponível).
export default function Erro({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="py-16 text-center">
      <h1 className="text-xl font-bold">Não foi possível carregar os dados</h1>
      <p className="mt-1 text-suave">Verifica a ligação à internet e tenta outra vez.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex h-11 items-center rounded-xl bg-clube px-5 font-semibold text-clube-texto"
      >
        Tentar outra vez
      </button>
    </div>
  );
}
