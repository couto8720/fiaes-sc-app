import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Utilização",
  description: "Condições de utilização do site e da app do Fiães Sport Clube.",
};

// Atualizar esta data sempre que o texto mudar.
const ATUALIZADO_EM = "13 de novembro de 2026";

export default function Termos() {
  return (
    <article className="space-y-6 pb-4 leading-relaxed">
      <header>
        <h1 className="font-display text-4xl uppercase leading-none">Termos de Utilização</h1>
        <p className="mt-2 text-sm text-suave">Última atualização: {ATUALIZADO_EM}</p>
        <p className="mt-3">
          Estes termos explicam como podes usar o site e a app do Fiães Sport Clube. Ao acederes, concordas com
          estas condições.
        </p>
      </header>

      <Seccao titulo="O que é este site">
        <p>
          Este site existe para divulgar os jogos, resultados, classificações e informação das equipas do Fiães Sport
          Clube. É uma ferramenta gratuita para adeptos, treinadores e staff do clube.
        </p>
      </Seccao>

      <Seccao titulo="Quem pode usar">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Qualquer pessoa</strong> pode ver jogos, resultados e classificações.
          </li>
          <li>
            <strong>Adeptos</strong> podem criar conta para personalizar o site (escolher escalões a seguir).
          </li>
          <li>
            <strong>Staff do clube</strong> (treinadores, delegados, direção) têm acesso ao painel de administração por
            convite.
          </li>
        </ul>
      </Seccao>

      <Seccao titulo="Como usar corretamente">
        <ul className="list-disc space-y-1 pl-5">
          <li>Não podes usar o site para spam, ataques ou atividades ilegais.</li>
          <li>Não podes fazer cópias em massa da informação ou dos dados.</li>
          <li>Não podes tentar aceder a contas que não são tuas.</li>
          <li>Não podes publicar conteúdo ofensivo, abusivo ou ilegal.</li>
          <li>Se vires algo ilegal ou prejudicial, contacta a direção do clube.</li>
        </ul>
      </Seccao>

      <Seccao titulo="Contas de utilizador">
        <p>
          Se criares uma conta de adepto, és responsável por manter a tua palavra-passe segura. Não podes partilhar a
          tua conta com outras pessoas. Se suspeitas que a tua conta foi comprometida, muda a palavra-passe ou
          contacta-nos.
        </p>
        <p>
          Podes apagar a tua conta a qualquer momento em "A minha conta". Quando apagares, todos os teus dados são
          eliminados de imediato (não dá para desfazer).
        </p>
      </Seccao>

      <Seccao titulo="Contas de staff">
        <p>
          Contas de treinadores, delegados e direção são criadas apenas por convite do clube. Estas contas têm acesso
          privilegiado e não devem ser partilhadas.
        </p>
        <p>
          Se deixas de colaborar com o clube, a tua conta será desativada. Se perderes acesso, contacta a direção.
        </p>
      </Seccao>

      <Seccao titulo="Informação no site">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Resultados e classificações</strong> são mantidas pela direção do clube e devem ser precisas.
          </li>
          <li>
            <strong>Nomes de atletas</strong> aparecem apenas de forma abreviada (ex.: "João S.") para proteção.
          </li>
          <li>
            <strong>Dados de menores</strong> são tratados com cuidado especial, de acordo com a RGPD e a legislação
            portuguesa.
          </li>
          <li>Não publicamos datas de nascimento, moradas nem contactos de atletas.</li>
        </ul>
      </Seccao>

      <Seccao titulo="Direitos autorais">
        <p>
          O design e o código deste site pertencem ao Fiães Sport Clube. Podes ver a informação desportiva (jogos,
          resultados), mas não podes reutilizar, vender ou republicar sem permissão.
        </p>
        <p>
          Se queres usar dados do clube para fins comerciais ou em publicações, contacta a direção do Fiães Sport
          Clube.
        </p>
      </Seccao>

      <Seccao titulo="Ausência de garantia">
        <p>
          Este site é disponibilizado "como está". Embora tentemos manter a informação precisa e o site disponível, não
          podemos garantir:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Que o site não terá erros ou interrupções.</li>
          <li>Que todos os dados estão sempre 100% corretos (erros podem acontecer).</li>
          <li>Que o site estará disponível a toda a hora.</li>
        </ul>
        <p>
          O Fiães Sport Clube não é responsável por danos causados pelo uso (ou falta de uso) deste site.
        </p>
      </Seccao>

      <Seccao titulo="Segurança">
        <p>
          Tentamos proteger a informação e as contas, mas a segurança na internet nunca é 100% garantida. Se
          descobrires um problema de segurança, contacta a direção em vez de publicares online.
        </p>
      </Seccao>

      <Seccao titulo="Mudanças nestes termos">
        <p>
          O Fiães Sport Clube pode atualizar estes termos a qualquer momento. A data de última atualização está no
          topo desta página. Se continuares a usar o site após mudanças, significa que aceitas os novos termos.
        </p>
      </Seccao>

      <Seccao titulo="Lei aplicável">
        <p>
          Estes termos são regulados pela lei portuguesa. Qualquer disputa será resolvida nos tribunais competentes em
          Santa Maria da Feira.
        </p>
      </Seccao>

      <Seccao titulo="Contacto">
        <p>
          Se tiveres dúvidas sobre estes termos ou o site, contacta a direção do Fiães Sport Clube pelos canais
          oficiais do clube ou na sede.
        </p>
      </Seccao>

      <p className="text-sm text-suave">
        <Link href="/" className="font-semibold text-clube underline dark:text-destaque">
          ← Voltar ao início
        </Link>
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
