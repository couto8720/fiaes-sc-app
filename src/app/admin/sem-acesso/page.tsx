import type { Metadata } from "next";
import { CartaoEntrada } from "@/components/admin/CartaoEntrada";
import { APP_PRIVADA } from "@/lib/acesso";
import { sair } from "../acoes/auth";

export const metadata: Metadata = { title: "Sem acesso", robots: { index: false } };

export default function SemAcesso() {
  return (
    <CartaoEntrada
      titulo="Sem acesso"
      descricao={
        APP_PRIVADA
          ? "A aplicação está privada por enquanto: só a administração do clube a pode usar."
          : "A tua conta está desativada ou ainda não tem perfil."
      }
    >
      <p className="text-sm">
        {APP_PRIVADA ? "Volta mais tarde, quando a aplicação abrir ao público." : "Fala com o responsável do clube para reativar o acesso."}
      </p>
      <form action={sair} className="mt-4">
        <button className="h-11 rounded-xl border border-borda px-4 font-semibold">Sair</button>
      </form>
    </CartaoEntrada>
  );
}
