// Validação dos formulários do painel. Funções puras (sem Next nem Supabase) para serem testáveis.
import { lisboaParaISO } from "./datas.ts";

export type Erros = Record<string, string>;
export type Resultado<T> = { ok: true; dados: T } | { ok: false; erros: Erros };

export const ESTADOS = ["agendado", "primeira_parte", "intervalo", "segunda_parte", "final", "adiado", "cancelado"] as const;
export type Estado = (typeof ESTADOS)[number];
export const PAPEIS = ["super_admin", "treinador"] as const;

type Campos = Record<string, string | undefined>;

const texto = (v: string | undefined) => (v ?? "").trim();
const opcional = (v: string | undefined) => texto(v) || null;

function inteiro(v: string | undefined, min: number, max: number): number | null | "invalido" {
  const t = texto(v);
  if (!t) return null;
  if (!/^-?\d+$/.test(t)) return "invalido";
  const n = Number(t);
  return n < min || n > max ? "invalido" : n;
}

/** "Sub-13 Feminino" → "sub-13-feminino" */
export function slugificar(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------- Jogos ----------

export type DadosJogo = {
  escalao_id: string;
  competicao: string | null;
  jornada: number | null;
  data_hora: string;
  local_id: string | null;
  novo_local: string | null;
  em_casa: boolean;
  adversario: string;
  estado: Estado;
  golos_clube: number | null;
  golos_adversario: number | null;
  notas: string | null;
};

export function validarJogo(c: Campos): Resultado<DadosJogo> {
  const erros: Erros = {};

  const escalao_id = texto(c.escalao_id);
  if (!escalao_id) erros.escalao_id = "Escolhe o escalão.";

  const data_hora = lisboaParaISO(texto(c.data), texto(c.hora));
  if (!data_hora) erros.data = "Indica uma data e hora válidas.";

  const adversario = texto(c.adversario);
  if (!adversario) erros.adversario = "Indica o adversário.";
  else if (adversario.length > 80) erros.adversario = "Máximo de 80 caracteres.";

  const competicao = opcional(c.competicao);
  if (competicao && competicao.length > 80) erros.competicao = "Máximo de 80 caracteres.";

  const jornada = inteiro(c.jornada, 1, 99);
  if (jornada === "invalido") erros.jornada = "Jornada entre 1 e 99.";

  if (c.em_casa !== "1" && c.em_casa !== "0") erros.em_casa = "Indica se é em casa ou fora.";

  const estado = texto(c.estado) || "agendado";
  if (!ESTADOS.includes(estado as Estado)) erros.estado = "Estado inválido.";

  const gc = inteiro(c.golos_clube, 0, 99);
  const ga = inteiro(c.golos_adversario, 0, 99);
  if (gc === "invalido" || ga === "invalido") erros.golos = "Golos entre 0 e 99.";
  else if ((gc === null) !== (ga === null)) erros.golos = "Preenche os golos das duas equipas (ou nenhum).";
  else if (estado === "final" && gc === null) erros.golos = "Um jogo terminado precisa do resultado.";

  const notas = opcional(c.notas);
  if (notas && notas.length > 300) erros.notas = "Máximo de 300 caracteres.";

  const novo_local = opcional(c.novo_local);
  if (novo_local && novo_local.length > 80) erros.novo_local = "Máximo de 80 caracteres.";

  if (Object.keys(erros).length) return { ok: false, erros };
  return {
    ok: true,
    dados: {
      escalao_id,
      competicao,
      jornada: jornada as number | null,
      data_hora: data_hora!,
      local_id: novo_local ? null : opcional(c.local_id),
      novo_local,
      em_casa: c.em_casa === "1",
      adversario,
      estado: estado as Estado,
      golos_clube: gc as number | null,
      golos_adversario: ga as number | null,
      notas,
    },
  };
}

// ---------- Locais ----------

export type DadosLocal = { nome: string; morada: string | null; maps_url: string | null };

export function validarLocal(c: Campos): Resultado<DadosLocal> {
  const erros: Erros = {};
  const nome = texto(c.nome);
  if (!nome) erros.nome = "Indica o nome do local.";
  else if (nome.length > 80) erros.nome = "Máximo de 80 caracteres.";
  const morada = opcional(c.morada);
  if (morada && morada.length > 150) erros.morada = "Máximo de 150 caracteres.";
  const maps_url = opcional(c.maps_url);
  if (maps_url && !/^https:\/\/\S+$/.test(maps_url)) erros.maps_url = "Tem de ser um link https:// (ex.: do Google Maps).";
  return Object.keys(erros).length ? { ok: false, erros } : { ok: true, dados: { nome, morada, maps_url } };
}

// ---------- Escalões ----------

export type DadosEscalao = {
  nome: string;
  slug: string;
  ordem: number;
  epoca: string;
  competicao: string | null;
  ativo: boolean;
};

export function validarEscalao(c: Campos): Resultado<DadosEscalao> {
  const erros: Erros = {};
  const nome = texto(c.nome);
  if (!nome) erros.nome = "Indica o nome (ex.: Sub-13).";
  else if (nome.length > 40) erros.nome = "Máximo de 40 caracteres.";
  const slug = slugificar(texto(c.slug) || nome);
  if (nome && !slug) erros.slug = "O endereço tem de ter letras ou números.";
  const ordem = inteiro(c.ordem, 0, 999);
  if (ordem === "invalido") erros.ordem = "Número entre 0 e 999.";
  const epoca = texto(c.epoca);
  if (!/^\d{4}\/\d{2}$/.test(epoca)) erros.epoca = "Formato 2026/27.";
  const competicao = opcional(c.competicao);
  if (competicao && competicao.length > 80) erros.competicao = "Máximo de 80 caracteres.";
  if (Object.keys(erros).length) return { ok: false, erros };
  return {
    ok: true,
    dados: { nome, slug, ordem: (ordem as number | null) ?? 0, epoca, competicao, ativo: c.ativo === "on" },
  };
}

// ---------- Classificação ----------

export type DadosLinhaClassificacao = {
  posicao: number;
  equipa: string;
  e_o_clube: boolean;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golos_marcados: number;
  golos_sofridos: number;
  pontos: number;
};

const CAMPOS_NUMERICOS = ["posicao", "jogos", "vitorias", "empates", "derrotas", "golos_marcados", "golos_sofridos", "pontos"] as const;

/** Valida a tabela inteira (vinda do editor em JSON). Os erros vêm como "linha 3: …". */
export function validarClassificacao(entrada: unknown): Resultado<DadosLinhaClassificacao[]> {
  if (!Array.isArray(entrada)) return { ok: false, erros: { tabela: "Dados inválidos." } };
  if (entrada.length > 40) return { ok: false, erros: { tabela: "Máximo de 40 equipas." } };

  const erros: string[] = [];
  const linhas: DadosLinhaClassificacao[] = [];
  const vistos = new Set<string>();
  const posicoes = new Set<number>();

  entrada.forEach((bruta, k) => {
    const n = k + 1;
    const l = (bruta ?? {}) as Record<string, unknown>;
    const equipa = String(l.equipa ?? "").trim().replace(/\s+/g, " ");
    if (!equipa) erros.push(`linha ${n}: falta o nome da equipa`);
    else if (equipa.length > 80) erros.push(`linha ${n}: nome demasiado longo`);
    else if (vistos.has(equipa.toLowerCase())) erros.push(`linha ${n}: “${equipa}” aparece repetida`);
    vistos.add(equipa.toLowerCase());

    const nums = {} as Record<(typeof CAMPOS_NUMERICOS)[number], number>;
    for (const c of CAMPOS_NUMERICOS) {
      const v = Number(l[c]);
      const [min, max] = c === "pontos" ? [-99, 999] : c === "posicao" ? [1, 99] : [0, 999];
      if (l[c] === "" || l[c] === null || !Number.isInteger(v) || v < min || v > max) {
        erros.push(`linha ${n}: valor inválido em ${c.replace("_", " ")}`);
      }
      nums[c] = v;
    }
    if (posicoes.has(nums.posicao)) erros.push(`linha ${n}: posição ${nums.posicao} repetida`);
    posicoes.add(nums.posicao);

    linhas.push({ ...nums, equipa, e_o_clube: l.e_o_clube === true });
  });

  if (linhas.filter((l) => l.e_o_clube).length > 1) erros.push("Só uma equipa pode estar marcada como o clube.");
  if (erros.length) return { ok: false, erros: { tabela: erros.slice(0, 5).join("; ") } };
  return { ok: true, dados: linhas.sort((a, b) => a.posicao - b.posicao) };
}

// ---------- Configuração do clube ----------

export type DadosClube = {
  nome: string;
  nome_curto: string;
  cor_primaria: string;
  cor_secundaria: string;
  cor_destaque: string;
  hashtag: string | null;
  logo_url: string | null;
};

const HEX = /^#[0-9a-f]{6}$/i;

export function validarClube(c: Campos): Resultado<DadosClube> {
  const erros: Erros = {};
  const nome = texto(c.nome);
  if (!nome || nome.length > 80) erros.nome = "Indica o nome (até 80 caracteres).";
  const nome_curto = texto(c.nome_curto);
  if (!nome_curto || nome_curto.length > 24) erros.nome_curto = "Indica o nome curto (até 24 caracteres).";
  const cores = {} as Pick<DadosClube, "cor_primaria" | "cor_secundaria" | "cor_destaque">;
  for (const k of ["cor_primaria", "cor_secundaria", "cor_destaque"] as const) {
    const v = texto(c[k]).toUpperCase();
    if (!HEX.test(v)) erros[k] = "Cor no formato #RRGGBB.";
    cores[k] = v;
  }
  let hashtag = opcional(c.hashtag);
  if (hashtag && !hashtag.startsWith("#")) hashtag = `#${hashtag}`;
  if (hashtag && !/^#[\p{L}\p{N}_]{1,40}$/u.test(hashtag)) erros.hashtag = "Só letras, números e _ (sem espaços).";
  const logo_url = opcional(c.logo_url);
  if (logo_url && !/^https:\/\/\S+$/.test(logo_url)) erros.logo_url = "Tem de ser um link https:// para a imagem.";
  return Object.keys(erros).length ? { ok: false, erros } : { ok: true, dados: { nome, nome_curto, ...cores, hashtag, logo_url } };
}

// ---------- Utilizadores ----------

export type DadosConvite = { nome: string; email: string; papel: (typeof PAPEIS)[number] };

export function validarConvite(c: Campos): Resultado<DadosConvite> {
  const erros: Erros = {};
  const nome = texto(c.nome);
  if (!nome) erros.nome = "Indica o nome.";
  else if (nome.length > 60) erros.nome = "Máximo de 60 caracteres.";
  const email = texto(c.email).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erros.email = "Email inválido.";
  const papel = texto(c.papel) || "treinador";
  if (!PAPEIS.includes(papel as DadosConvite["papel"])) erros.papel = "Papel inválido.";
  return Object.keys(erros).length
    ? { ok: false, erros }
    : { ok: true, dados: { nome, email, papel: papel as DadosConvite["papel"] } };
}

// Regras das palavras-passe: iguais às definidas no Supabase (Authentication → Sign In / Providers → Email).
export const REGRAS_PALAVRA_PASSE = [
  { id: "tamanho", texto: "Pelo menos 10 caracteres", falta: "pelo menos 10 caracteres", cumpre: (s: string) => s.length >= 10 },
  { id: "minuscula", texto: "Uma letra minúscula", falta: "uma letra minúscula", cumpre: (s: string) => /\p{Ll}/u.test(s) },
  { id: "maiuscula", texto: "Uma letra maiúscula", falta: "uma letra maiúscula", cumpre: (s: string) => /\p{Lu}/u.test(s) },
  { id: "numero", texto: "Um número", falta: "um número", cumpre: (s: string) => /\d/.test(s) },
] as const;

const juntar = (itens: string[]) => (itens.length > 1 ? `${itens.slice(0, -1).join(", ")} e ${itens.at(-1)}` : itens[0]);

export function validarPalavraPasse(nova: string | undefined, confirmacao: string | undefined): string | null {
  const faltam = REGRAS_PALAVRA_PASSE.filter((r) => !r.cumpre(nova ?? "")).map((r) => r.falta);
  if (faltam.length) return `A palavra-passe precisa de ter ${juntar(faltam)}.`;
  if (nova !== confirmacao) return "As palavras-passe não coincidem.";
  return null;
}

/** Erros do Supabase ao mudar a palavra-passe, em português (o Supabase responde em inglês). */
export function mensagemErroPalavraPasse(codigo: string | undefined, motivos: readonly string[] = []): string {
  switch (codigo) {
    case "same_password":
      return "A nova palavra-passe tem de ser diferente da anterior.";
    case "weak_password":
      if (motivos.includes("pwned")) return "Essa palavra-passe apareceu em fugas de dados na internet. Escolhe outra.";
      if (motivos.includes("length")) return "A palavra-passe é demasiado curta. Usa pelo menos 10 caracteres.";
      return "A palavra-passe é fraca. Usa letras minúsculas, maiúsculas e números.";
    case "reauthentication_needed":
    case "reauthentication_not_valid":
      return "Por segurança, sai e volta a entrar (ou usa “Esqueci-me da palavra-passe”) antes de mudar a palavra-passe.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Demasiadas tentativas seguidas. Espera uns minutos e tenta outra vez.";
    case "session_not_found":
    case "session_expired":
    case "otp_expired":
      return "A sessão ou o link expirou. Pede um novo link em “Esqueci-me da palavra-passe”.";
    default:
      return "Não foi possível guardar. O link pode ter expirado.";
  }
}

/** Só aceita caminhos internos do painel ou da conta de adepto (evita redirecionar para outro site). */
export function destinoSeguro(v: string | undefined | null) {
  return v && /^\/(admin|conta)(\/[\w\-/]*)?$/.test(v) ? v : "/admin";
}

export type DadosAdepto = { nome: string; numero_socio: string | null; escaloes: string[] };

/** Perfil do adepto: nome obrigatório, número de sócio opcional, escalões seguidos (só os que existem). */
export function validarPerfilAdepto(
  c: { nome?: string; numero_socio?: string; escaloes?: string[] },
  escaloesValidos: string[],
): Resultado<DadosAdepto> {
  const erros: Erros = {};
  const nome = (c.nome ?? "").trim().replace(/\s+/g, " ");
  if (!nome) erros.nome = "Indica o teu nome.";
  else if (nome.length > 80) erros.nome = "Nome demasiado comprido (máximo 80 letras).";
  const numero = (c.numero_socio ?? "").trim();
  if (numero.length > 20) erros.numero_socio = "Número de sócio demasiado comprido.";
  const escaloes = [...new Set(c.escaloes ?? [])].filter((s) => escaloesValidos.includes(s)).slice(0, 30);
  return Object.keys(erros).length
    ? { ok: false, erros }
    : { ok: true, dados: { nome, numero_socio: numero || null, escaloes } };
}
