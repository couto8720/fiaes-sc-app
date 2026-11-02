import type { Metadata } from "next";
import { CartaoEntrada } from "@/components/admin/CartaoEntrada";
import { FormRecuperar } from "@/components/admin/FormulariosEntrada";

export const metadata: Metadata = { title: "Recuperar palavra-passe", robots: { index: false } };

export default function PaginaRecuperarConta() {
  return (
    <CartaoEntrada area="Sócios e adeptos" titulo="Recuperar" descricao="Enviamos-te um link para definires uma nova palavra-passe.">
      <FormRecuperar area="conta" />
    </CartaoEntrada>
  );
}
