import type { Metadata } from "next";
import { CartaoEntrada } from "@/components/admin/CartaoEntrada";
import { FormRecuperar2FA } from "@/components/admin/FormulariosEntrada";

export const metadata: Metadata = {
  title: "Recuperar Autenticação 2FA",
  robots: { index: false },
};

export default function PaginaRecuperar2FA() {
  return (
    <CartaoEntrada titulo="Recuperar Autenticação 2FA" descricao="Se perdeste acesso ao teu dispositivo de autenticação, podes utilizar um código de backup ou contactar o suporte.">
      <FormRecuperar2FA />
    </CartaoEntrada>
  );
}
