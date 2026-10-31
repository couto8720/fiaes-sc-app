// Estado devolvido pelas ações dos formulários do painel (useActionState).
export type EstadoFormulario = {
  erro?: string;
  erros?: Record<string, string>;
  ok?: string;
  /** Valores submetidos, para o formulário não perder o que foi escrito quando há erros. */
  valores?: Record<string, string>;
};

export const ESTADO_INICIAL: EstadoFormulario = {};

export function valoresDe(fd: FormData): Record<string, string> {
  const v: Record<string, string> = {};
  fd.forEach((valor, chave) => {
    if (typeof valor === "string" && !chave.startsWith("$")) v[chave] = valor;
  });
  return v;
}

/** Traduz erros comuns do Postgres/Supabase para mensagens claras. */
export function mensagemErroBD(e: { code?: string; message?: string } | null): string {
  if (!e) return "Erro desconhecido.";
  if (e.code === "42501") return "Não tens permissão para fazer esta alteração.";
  if (e.code === "23505") return "Já existe um registo com esses dados.";
  if (e.code === "23503") return "Há dados ligados a este registo; não pode ser apagado.";
  if (e.code === "23514") return "Algum valor está fora do permitido.";
  return "Não foi possível guardar. Tenta outra vez.";
}
