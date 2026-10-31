import type { Metadata } from "next";
import { CartaoEntrada } from "@/components/admin/CartaoEntrada";
import { AceitarConvite } from "@/components/admin/AceitarConvite";

export const metadata: Metadata = { title: "Convite", robots: { index: false } };

// Destino do link do email de convite (modelo padrão do Supabase).
export default function PaginaConvite() {
  return (
    <CartaoEntrada titulo="Bem-vindo ao painel" descricao="A confirmar o teu convite…">
      <AceitarConvite />
    </CartaoEntrada>
  );
}
