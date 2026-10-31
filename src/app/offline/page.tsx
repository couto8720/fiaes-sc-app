import type { Metadata } from "next";
import { BotaoRecarregar } from "@/components/BotaoRecarregar";

export const metadata: Metadata = { title: "Sem ligação", robots: { index: false } };

// Mostrada pelo service worker quando não há rede e a página pedida nunca foi aberta antes.
export default function SemLigacao() {
  return (
    <div className="py-16 text-center">
      <p aria-hidden className="text-5xl">📶</p>
      <h1 className="mt-3 text-xl font-bold">Sem ligação à internet</h1>
      <p className="mt-1 text-suave">
        As páginas que já abriste continuam disponíveis. Quando a rede voltar, os resultados atualizam-se.
      </p>
      <BotaoRecarregar />
    </div>
  );
}
