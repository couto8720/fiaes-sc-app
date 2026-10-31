import { conteudoPost, parametrosPost } from "@/lib/postDados";
import { formatarIntervalo } from "@/lib/datas";
import { AcoesPost } from "./AcoesPost";
import { classeInput } from "./ui";

/** Conteúdo da página "Post": escolher o fim de semana, pré-visualizar, descarregar/partilhar, copiar a legenda. */
export async function GeradorPost({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { de, ate, formato } = await parametrosPost(await searchParams);
  const { itens, paginas, texto } = await conteudoPost(de, ate, formato);

  const base = `/admin/post/imagem?de=${de}&ate=${ate}&formato=${formato}`;
  const urls = paginas.map((_, k) => `${base}&pagina=${k + 1}`);
  const nomes = paginas.map((_, k) => `resultados-${de}${paginas.length > 1 ? `-${k + 1}` : ""}${formato === "story" ? "-story" : ""}.png`);
  const comResultado = itens.filter((i) => !i.nota).length;

  return (
    <div className="space-y-5">
      {/* Escolha do intervalo: formulário GET, para o URL ficar partilhável e o "voltar" funcionar */}
      <form className="grid grid-cols-2 gap-3 rounded-2xl border border-borda bg-superficie p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
        <label className="space-y-1.5 text-sm font-semibold">
          <span className="block">De</span>
          <input type="date" name="de" defaultValue={de} className={classeInput} />
        </label>
        <label className="space-y-1.5 text-sm font-semibold">
          <span className="block">Até</span>
          <input type="date" name="ate" defaultValue={ate} className={classeInput} />
        </label>
        <label className="col-span-2 space-y-1.5 text-sm font-semibold sm:col-span-1">
          <span className="block">Formato</span>
          <select name="formato" defaultValue={formato} className={classeInput}>
            <option value="feed">Feed (4:5)</option>
            <option value="story">Story (9:16)</option>
          </select>
        </label>
        <button className="col-span-2 h-12 rounded-xl border border-borda bg-fundo px-5 font-semibold sm:col-span-1">Atualizar</button>
      </form>

      <p className="text-sm text-suave">
        {formatarIntervalo(de, ate)} · {comResultado} {comResultado === 1 ? "resultado" : "resultados"}
        {itens.length > comResultado ? ` · ${itens.length - comResultado} adiado(s)/cancelado(s)` : ""}
        {paginas.length > 1 ? ` · ${paginas.length} imagens (carrossel)` : ""}
        . Só entram jogos com “Final do Jogo”, “Adiado” ou “Cancelado”.
      </p>

      <div className={`grid gap-3 ${paginas.length > 1 ? "grid-cols-2" : "mx-auto max-w-sm"}`}>
        {urls.map((u, k) => (
          // eslint-disable-next-line @next/next/no-img-element -- PNG gerado na hora pela rota do post
          <img key={u} src={u} alt={`Imagem ${k + 1} do post`} className="w-full rounded-xl border border-borda shadow-sm" />
        ))}
      </div>

      <AcoesPost urls={urls} nomes={nomes} texto={texto} />
    </div>
  );
}
