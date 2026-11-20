"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { exigirSessao, exigirSuperAdmin } from "@/lib/sessao";
import { validarLocal } from "@/lib/validacao";
import { mensagemErroBD, valoresDe, type EstadoFormulario } from "./tipos";

export async function guardarLocal(_: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await exigirSessao();
  const valores = valoresDe(fd);
  const r = validarLocal(valores);
  if (!r.ok) return { erros: r.erros, valores };

  const supabase = await createClient();
  const { data, error } = valores.id
    ? await supabase.from("locais" as any).update(r.dados as any).eq("id", valores.id).select("id")
    : await supabase.from("locais" as any).insert(r.dados as any).select("id");
  if (error) return { erro: mensagemErroBD(error), valores };
  if (!data?.length) return { erro: "Não foi possível guardar.", valores };
  redirect("/admin/locais");
}

export async function apagarLocal(fd: FormData) {
  await exigirSuperAdmin();
  const supabase = await createClient();
  // Os jogos que usavam este local ficam com "local a definir" (on delete set null).
  await supabase.from("locais" as any).delete().eq("id", String(fd.get("id")));
  redirect("/admin/locais");
}
