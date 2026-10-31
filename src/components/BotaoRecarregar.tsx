"use client";

export function BotaoRecarregar() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="mt-6 inline-flex h-11 items-center rounded-xl bg-clube px-5 font-semibold text-clube-texto"
    >
      Tentar outra vez
    </button>
  );
}
