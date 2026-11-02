import type { Metadata } from "next";
import { CartaoEntrada } from "@/components/admin/CartaoEntrada";
import { FormDefinirPalavraPasse } from "@/components/admin/FormulariosEntrada";

export const metadata: Metadata = { title: "Nova palavra-passe", robots: { index: false } };

// Chega-se aqui pelo link de recuperação (via /auth/confirm, que já iniciou a sessão) ou pela conta.
export default function PaginaPalavraPasseConta() {
  return (
    <CartaoEntrada area="Sócios e adeptos" titulo="Palavra-passe" descricao="Escolhe a nova palavra-passe.">
      <FormDefinirPalavraPasse />
    </CartaoEntrada>
  );
}
