"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { exigirSuperAdmin } from "@/lib/sessao";
import { validarEscalao } from "@/lib/validacao";
import { mensagemErroBD, valoresDe, type EstadoFormulario } from "./tipos";

export async function guardarEscalao(_: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await exigirSuperAdmin();
  const valores = valoresDe(fd);
  const r = validarEscalao(valores);
  if (!r.ok) return { erros: r.erros, valores };

  const supabase = await createClient();
  const { data, error } = valores.id
    ? await supabase.from("escaloes" as any).update(r.dados as any).eq("id", valores.id).select("id")
    : await supabase.from("escaloes" as any).insert(r.dados as any).select("id");
  if (error?.code === "23505") return { erros: { slug: "Já existe um escalão com este endereço." }, valores };
  if (error) return { erro: mensagemErroBD(error), valores };
  if (!data?.length) return { erro: "Não foi possível guardar.", valores };
  redirect("/admin/escaloes");
}
