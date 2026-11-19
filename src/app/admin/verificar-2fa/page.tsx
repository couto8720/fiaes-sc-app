import type { Metadata } from "next";
import { Suspense } from "react";
import { CartaoEntrada } from "@/components/admin/CartaoEntrada";
import { FormVerificacao2FA } from "@/components/admin/FormVerificacao2FA";

export const metadata: Metadata = { title: "Verificar 2FA", robots: { index: false } };

export default function PaginaVerificacao2FA() {
  return (
    <CartaoEntrada titulo="Autenticação de Dois Fatores" descricao="Introduz o código da tua aplicação de autenticação.">
      <Suspense>
        <FormVerificacao2FA />
      </Suspense>
    </CartaoEntrada>
  );
}
