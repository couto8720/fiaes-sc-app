"use server";

import { createClient } from "@/lib/supabase/server";
import { exigirSuperAdmin } from "@/lib/sessao";
import { validarClube } from "@/lib/validacao";
import { mensagemErroBD, valoresDe, type EstadoFormulario } from "./tipos";

export async function guardarClube(_: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await exigirSuperAdmin();
  const valores = valoresDe(fd);
  const r = validarClube(valores);
  if (!r.ok) return { erros: r.erros, erro: "Corrige os campos assinalados.", valores };

  const supabase = await createClient();
  // Só existe uma linha de configuração (id = true); se ainda não existir, é criada.
  const { error } = await supabase.from("clube_config").upsert({ id: true, ...r.dados });
  if (error) return { erro: mensagemErroBD(error), valores };
  return { ok: "Guardado. O site, os ícones e o post já usam estes dados.", valores };
}
