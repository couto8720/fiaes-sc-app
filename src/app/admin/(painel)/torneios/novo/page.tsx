import type { Metadata } from "next";
import Link from "next/link";
import { exigirSessao } from "@/lib/sessao";
import { FormularioNovoTorneio } from "./formulario";

export const metadata: Metadata = { title: "Novo Torneio" };

export default async function PaginaNovoTorneio() {
  const sessao = await exigirSessao();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/torneios" className="mb-4 inline-flex items-center text-clube">
        ← Voltar
      </Link>

      <h1 className="mb-2 text-3xl font-black tracking-tight">Criar Novo Torneio</h1>
      <p className="mb-6 text-suave">
        Configure os detalhes do torneio, equipas e critérios de classificação
      </p>

      <FormularioNovoTorneio usuarioId={sessao.user.id} />
    </div>
  );
}
