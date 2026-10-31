import type { Metadata } from "next";
import { CartaoEntrada } from "@/components/admin/CartaoEntrada";
import { FormRecuperar } from "@/components/admin/FormulariosEntrada";

export const metadata: Metadata = { title: "Recuperar palavra-passe", robots: { index: false } };

export default function PaginaRecuperar() {
  return (
    <CartaoEntrada titulo="Recuperar palavra-passe" descricao="Enviamos-te um link para definires uma nova.">
      <FormRecuperar />
    </CartaoEntrada>
  );
}
