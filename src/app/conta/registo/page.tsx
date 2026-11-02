import type { Metadata } from "next";
import Link from "next/link";
import { CartaoEntrada } from "@/components/admin/CartaoEntrada";
import { FormRegistoAdepto } from "@/components/conta/FormulariosConta";

export const metadata: Metadata = { title: "Criar conta", robots: { index: false } };

export default function PaginaRegisto() {
  return (
    <CartaoEntrada
      area="Sócios e adeptos"
      titulo="Criar conta"
      descricao="Grátis. Para seguires os teus escalões e guardares o teu número de sócio."
      rodape={
        <p>
          Já tens conta?{" "}
          <Link href="/conta" className="font-semibold text-clube underline underline-offset-2 dark:text-destaque">
            Entrar
          </Link>
        </p>
      }
    >
      <FormRegistoAdepto />
    </CartaoEntrada>
  );
}
