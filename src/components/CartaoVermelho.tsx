/** Pequeno cartão vermelho (retângulo), igual no painel e no site. */
export function CartaoVermelho({ claro = false, className = "" }: { claro?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-4 w-3 shrink-0 rounded-[2px] shadow-sm ${claro ? "bg-white" : "bg-red-600"} ${className}`}
    />
  );
}
