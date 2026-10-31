import type { Metadata } from "next";
import { Suspense } from "react";
import { CartaoEntrada } from "@/components/admin/CartaoEntrada";
import { FormLogin } from "@/components/admin/FormulariosEntrada";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default function PaginaLogin() {
  return (
    <CartaoEntrada titulo="Entrar" descricao="Só para treinadores, delegados e direção do clube.">
      <Suspense>
        <FormLogin />
      </Suspense>
    </CartaoEntrada>
  );
}
