import type { Metadata } from "next";
import { CartaoEntrada } from "@/components/admin/CartaoEntrada";
import { FormDefinirPalavraPasse } from "@/components/admin/FormulariosEntrada";

export const metadata: Metadata = { title: "Definir palavra-passe", robots: { index: false } };

// Chega-se aqui pelo link do convite ou da recuperação (via /auth/confirm, que já iniciou a sessão).
export default function PaginaDefinirPalavraPasse() {
  return (
    <CartaoEntrada titulo="Definir palavra-passe" descricao="Escolhe a palavra-passe que vais usar para entrar.">
      <FormDefinirPalavraPasse />
    </CartaoEntrada>
  );
}
