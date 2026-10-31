import "server-only";
import { agora, obterConfig, obterJogos } from "./dados";
import { chaveDia } from "./jogos";
import { fimDeSemanaAte, intervaloUTC } from "./datas";
import { FORMATOS, itensPost, paginar, textoPost, type Formato } from "./post";

const DIA = /^\d{4}-\d{2}-\d{2}$/;

/** Lê os parâmetros (?de=&ate=&formato=), com o fim de semana mais recente por omissão. */
export async function parametrosPost(p: Record<string, string | string[] | undefined>) {
  const omissao = fimDeSemanaAte(chaveDia(await agora()));
  let de = typeof p.de === "string" && DIA.test(p.de) ? p.de : omissao.de;
  let ate = typeof p.ate === "string" && DIA.test(p.ate) ? p.ate : omissao.ate;
  if (ate < de) [de, ate] = [ate, de];
  const formato: Formato = p.formato === "story" ? "story" : "feed";
  return { de, ate, formato };
}

/** Jogos, páginas e legenda do post para um intervalo de dias (hora de Lisboa). */
export async function conteudoPost(de: string, ate: string, formato: Formato) {
  const { desde, ateExclusivo } = intervaloUTC(de, ate);
  const [config, jogos] = await Promise.all([
    obterConfig(),
    obterJogos({ desde: new Date(desde!), ate: new Date(ateExclusivo!) }),
  ]);
  const itens = itensPost(jogos, config.nome_curto);
  return {
    config,
    itens,
    paginas: paginar(itens, FORMATOS[formato].porPagina),
    texto: textoPost(itens, { de, ate, hashtag: config.hashtag }),
  };
}
