import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ClubeConfig } from "./supabase/database.types";

/** Símbolo oficial do Fiães SC incluído na app (public/simbolo-fiaes.png, 425×512, fundo transparente). */
export const SIMBOLO_LOCAL = "/simbolo-fiaes.png";

/** Para <img> no browser: o logótipo configurado no painel ou, por omissão, o símbolo incluído. */
export const simboloSrc = (config: Pick<ClubeConfig, "logo_url">) => config.logo_url ?? SIMBOLO_LOCAL;

// Lido uma vez: o desenhador de imagens (Satori) precisa da imagem em si, não de um caminho relativo.
let simboloEmbutido: Promise<string> | null = null;

/** Para os PNG gerados no servidor (ícones, post): URL absoluto configurado ou o símbolo como data URI. */
export function simboloParaImagem(config: Pick<ClubeConfig, "logo_url">): Promise<string> {
  if (config.logo_url) return Promise.resolve(config.logo_url);
  simboloEmbutido ??= readFile(join(process.cwd(), "public", "simbolo-fiaes.png")).then(
    (b) => `data:image/png;base64,${b.toString("base64")}`,
  );
  return simboloEmbutido;
}
