import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacidade",
  description: "Que dados o site do Fiães Sport Clube usa, para quê, e como pedir para os ver, corrigir ou apagar.",
};

// Atualizar esta data sempre que o texto mudar.
const ATUALIZADO_EM = "2 de novembro de 2026";

// Página estática: descreve o que a app realmente guarda (ver lib/dados.ts, migrações e DicaInstalar/useFiltroEscalao).
export default function Privacidade() {
  return (
    <article className="space-y-6 pb-4 leading-relaxed">
      <header>
        <h1 className="font-display text-4xl uppercase leading-none">Privacidade</h1>
        <p className="mt-2 text-sm text-suave">Última atualização: {ATUALIZADO_EM}</p>
        <p className="mt-3">
          Este site existe para divulgar os jogos, resultados e classificações das equipas do Fiães Sport Clube.
          Usamos o mínimo de dados pessoais possível e explicamos aqui quais são.
        </p>
      </header>

      <Seccao titulo="Quem é responsável">
        <p>
          O <strong>Fiães Sport Clube</strong>, com sede em Fiães, Santa Maria da Feira, é o responsável pelos dados
          tratados neste site.
        </p>
      </Seccao>

      <Seccao titulo="Se só visitas o site">
        <ul className="list-disc space-y-1 pl-5">
          <li>Não precisas de conta e não te pedimos nenhum dado pessoal.</li>
          <li>Não usamos cookies de publicidade nem de estatísticas, nem ferramentas de seguimento.</li>
          <li>
            O teu telemóvel ou computador guarda apenas duas preferências, que nunca saem do teu aparelho: o escalão
            que escolheste no filtro e se já fechaste o aviso para instalar a app.
          </li>
          <li>
            Se instalares a app, algumas páginas ficam guardadas no aparelho para abrirem mais depressa e sem rede.
            Podes apagá-las desinstalando a app ou limpando os dados do site no browser.
          </li>
        </ul>
      </Seccao>

      <Seccao titulo="Atletas">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Nos marcadores e nas expulsões mostramos apenas o <strong>nome abreviado</strong> do atleta (primeiro nome
            e inicial do apelido, por exemplo “João S.”). O nome completo nunca é guardado.
          </li>
          <li>Não publicamos datas de nascimento, contactos, moradas nem fotografias de atletas neste site.</li>
          <li>
            Resultados, calendários e classificações são informação desportiva das competições em que o clube
            participa.
          </li>
          <li>
            Os pais ou encarregados de educação podem pedir, a qualquer momento, que o nome de um atleta menor deixe de
            aparecer. Retiramo-lo sem perguntas.
          </li>
        </ul>
      </Seccao>

      <Seccao titulo="Treinadores, delegados e direção">
        <p>
          Quem gere o site (com acesso pelo botão “Entrar”) tem uma conta com <strong>nome, email, função e escalões
          que gere</strong>. Ao entrar, o site usa um cookie de sessão, indispensável para manter a sessão aberta. As
          contas são criadas apenas por convite do clube e desativadas quando a pessoa deixa de colaborar.
        </p>
      </Seccao>

      <Seccao titulo="Para que usamos os dados">
        <ul className="list-disc space-y-1 pl-5">
          <li>Divulgar a atividade desportiva do clube (interesse legítimo do clube e dos seus adeptos).</li>
          <li>Gerir quem pode atualizar jogos e resultados (contas do staff).</li>
        </ul>
        <p>Não vendemos dados nem os partilhamos para publicidade.</p>
      </Seccao>

      <Seccao titulo="Onde ficam guardados">
        <p>
          Os dados ficam numa base de dados do serviço Supabase, em servidores na União Europeia (Frankfurt,
          Alemanha), com acesso protegido: o público só consegue ler a informação desportiva e cada membro do staff só
          altera os escalões que gere.
        </p>
      </Seccao>

      <Seccao titulo="Durante quanto tempo">
        <ul className="list-disc space-y-1 pl-5">
          <li>Resultados, marcadores e classificações ficam como histórico das épocas do clube.</li>
          <li>As contas do staff são desativadas quando a pessoa sai e apagadas se o pedir.</li>
        </ul>
      </Seccao>

      <Seccao titulo="Os teus direitos">
        <p>
          Podes pedir para ver, corrigir ou apagar os teus dados, ou opor-te à sua publicação. No caso de atletas
          menores, o pedido pode ser feito pelos pais ou encarregados de educação. Para isso, contacta a direção do
          Fiães Sport Clube pelos canais oficiais do clube ou na sede.
        </p>
        <p>
          Se achares que os teus dados não foram bem tratados, podes também apresentar reclamação à Comissão Nacional
          de Proteção de Dados (
          <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer" className="font-semibold text-clube underline dark:text-destaque">
            cnpd.pt
          </a>
          ).
        </p>
      </Seccao>

      <p className="text-sm text-suave">
        <Link href="/" className="font-semibold text-clube underline dark:text-destaque">← Voltar ao início</Link>
      </p>
    </article>
  );
}

function Seccao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-2xl uppercase leading-none text-clube dark:text-destaque">{titulo}</h2>
      {children}
    </section>
  );
}
