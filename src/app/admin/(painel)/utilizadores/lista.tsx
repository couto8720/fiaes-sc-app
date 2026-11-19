"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Perfil } from "@/lib/supabase/database.types";

export function ListaUtilizadores() {
  const [utilizadores, setUtilizadores] = useState<Perfil[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregarUtilizadores = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("perfis")
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;
      setUtilizadores(data || []);
    } catch (err) {
      setErro(`Erro ao carregar utilizadores: ${String(err)}`);
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarUtilizadores();
  }, [carregarUtilizadores]);

  if (carregando) {
    return <div className="text-center py-8 text-suave">A carregar utilizadores...</div>;
  }

  if (erro) {
    return <div className="bg-derrota/10 border border-derrota text-derrota p-4 rounded">{erro}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Utilizadores ({utilizadores.length})</h2>
        <Link href="/admin/utilizadores/novo" className="bg-vitoria hover:bg-vitoria/80 text-white px-4 py-2 rounded font-semibold">
          + Novo Utilizador
        </Link>
      </div>

      {utilizadores.length === 0 ? (
        <div className="text-center py-8 text-suave bg-site/50 rounded">
          Sem utilizadores registados. <Link href="/admin/utilizadores/novo" className="underline font-semibold">Criar primeiro utilizador</Link>
        </div>
      ) : (
        <div className="overflow-x-auto bg-site rounded border border-borda">
          <table className="w-full text-sm">
            <thead className="bg-clube/10 border-b border-borda">
              <tr>
                <th className="px-4 py-2 text-left">Nome</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Cargo</th>
                <th className="px-4 py-2 text-center">Ativo</th>
                <th className="px-4 py-2 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {utilizadores.map((user) => (
                <tr key={user.id} className="border-b border-borda hover:bg-clube/5">
                  <td className="px-4 py-3 font-semibold">{user.nome}</td>
                  <td className="px-4 py-3 text-suave">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.cargo === "admin" ? "bg-destaque text-black" :
                      user.cargo === "editor" ? "bg-vitoria/20 text-vitoria" :
                      "bg-suave/20 text-suave"
                    }`}>
                      {user.cargo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {user.ativo ? (
                      <span className="text-vitoria font-semibold">✓</span>
                    ) : (
                      <span className="text-derrota font-semibold">✗</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <Link
                      href={`/admin/utilizadores/${user.id}`}
                      className="text-suave underline underline-offset-1 hover:text-branco"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
