import type { Metadata } from "next";
import Link from "next/link";
import { CartaoEntrada } from "@/components/admin/CartaoEntrada";

export const metadata: Metadata = { title: "Conta apagada", robots: { index: false } };

export default function ContaApagada() {
  return (
    <CartaoEntrada area="Sócios e adeptos" titulo="Conta apagada" descricao="Os teus dados foram apagados.">
      <div className="space-y-4 text-sm">
        <p>
          Apagámos a tua conta: o email, o nome, o número de sócio e os escalões que seguias. Podes continuar a ver
          todos os jogos e resultados sem conta.
        </p>
        <Link href="/" className="flex h-12 items-center justify-center rounded-xl bg-clube font-semibold text-clube-texto">
          Ir para o início
        </Link>
      </div>
    </CartaoEntrada>
  );
}
