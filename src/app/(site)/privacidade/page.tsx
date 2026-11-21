import Link from "next/link";
import { VERSAO_POLITICA } from "@/lib/politica";

export const metadata = {
  title: "Política de Privacidade | Fiães SC",
  description: "Como o Fiães Sport Clube trata os dados pessoais na aplicação do clube.",
};

const EMAIL = "privacidade@fiaes.pt";

function dataPorExtenso(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
}

function Seccao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mt-8 mb-4">{titulo}</h2>
      {children}
    </section>
  );
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-slate-800 rounded-lg p-8 shadow-lg">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Voltar
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Política de Privacidade</h1>
          <p className="text-slate-400">Última atualização: {dataPorExtenso(VERSAO_POLITICA)}</p>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 space-y-6">
          <Seccao titulo="1. Quem é o responsável">
            <p>
              O responsável pelo tratamento dos dados pessoais nesta aplicação é o <strong>Fiães Sport Clube</strong>.
              Para qualquer questão sobre privacidade, escreve para <strong>{EMAIL}</strong>.
            </p>
            <p>
              Esta política aplica-se ao site e à aplicação do clube (calendário, resultados, classificações, torneios,
              contas de sócios e adeptos e painel do staff) e segue o Regulamento Geral sobre a Proteção de Dados (RGPD)
              e a Lei n.º 58/2019.
            </p>
          </Seccao>

          <Seccao titulo="2. Que dados tratamos">
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Visitantes sem conta:</strong> não pedimos dados. O browser guarda apenas preferências locais
                (por exemplo, se o menu está aberto ou a escolha no aviso de cookies), que não nos são enviadas.
              </li>
              <li>
                <strong>Contas de sócios e adeptos:</strong> nome, email, palavra-passe (guardada de forma cifrada,
                nunca em texto), número de sócio (opcional), escalões que segues e a data em que aceitaste esta política.
              </li>
              <li>
                <strong>Contas do staff</strong> (treinadores, delegados e direção): nome, email, função e escalões que
                gerem, e um registo das entradas e saídas do painel e de algumas ações (por exemplo, mudar a palavra-passe).
              </li>
              <li>
                <strong>Atletas:</strong> nos golos e expulsões aparece só o nome abreviado (primeiro nome e inicial,
                por exemplo «João S.»), porque muitos atletas são menores. Os nomes completos não são publicados.
              </li>
              <li>
                <strong>Dados técnicos:</strong> o serviço de alojamento regista dados técnicos dos pedidos (como o
                endereço IP) para funcionar e proteger o site.
              </li>
            </ul>
          </Seccao>

          <Seccao titulo="3. Para que usamos os dados e com que fundamento">
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Conta de adepto</strong> (mostrar os teus escalões e guardar as tuas preferências): execução do
                serviço que pediste ao criar a conta.
              </li>
              <li>
                <strong>Painel do staff</strong> (gerir jogos, resultados e classificações): interesse legítimo do clube
                na organização da sua atividade desportiva.
              </li>
              <li>
                <strong>Segurança</strong> (registo de acessos e limite de tentativas de login): interesse legítimo em
                proteger as contas e o serviço.
              </li>
              <li>
                <strong>Divulgação desportiva</strong> (resultados e marcadores com nome abreviado): interesse legítimo do
                clube, com a minimização descrita acima.
              </li>
            </ul>
            <p>Não usamos os dados para publicidade, não os vendemos e não fazemos perfis de comportamento.</p>
          </Seccao>

          <Seccao titulo="4. Durante quanto tempo guardamos os dados">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Conta de adepto:</strong> até a apagares (podes fazê-lo a qualquer momento em «A minha conta»).</li>
              <li><strong>Conta do staff:</strong> enquanto a pessoa colaborar com o clube; é desativada quando deixa de colaborar.</li>
              <li><strong>Registo de acessos e ações do staff:</strong> 90 dias, apagado automaticamente.</li>
              <li><strong>Tentativas de login:</strong> apagadas automaticamente quando expiram (15 minutos).</li>
              <li><strong>Resultados e marcadores:</strong> fazem parte do histórico desportivo do clube.</li>
            </ul>
          </Seccao>

          <Seccao titulo="5. Quem trata os dados por nossa conta">
            <p>Usamos estes prestadores de serviços, que só tratam os dados segundo as nossas instruções:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Supabase</strong> — base de dados, autenticação e envio dos emails da conta (confirmação e
                recuperação da palavra-passe). Os dados ficam em servidores na União Europeia.
              </li>
              <li>
                <strong>Netlify</strong> — alojamento do site. Pode tratar dados técnicos fora da União Europeia, com as
                garantias previstas no RGPD (cláusulas contratuais-tipo).
              </li>
            </ul>
            <p>Só partilhamos dados com outras entidades quando a lei o obrigar.</p>
          </Seccao>

          <Seccao titulo="6. Os teus direitos">
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Acesso e portabilidade:</strong> em «A minha conta», usa «Descarregar os meus dados» para
                receberes um ficheiro com tudo o que guardamos sobre ti.
              </li>
              <li><strong>Retificação:</strong> podes alterar o nome, o número de sócio e os escalões em «A minha conta».</li>
              <li><strong>Apagamento:</strong> podes apagar a tua conta em «A minha conta».</li>
              <li><strong>Oposição e limitação</strong> do tratamento, e qualquer outro pedido: escreve para {EMAIL}.</li>
            </ul>
            <p>Respondemos no prazo de um mês, como prevê o RGPD.</p>
          </Seccao>

          <Seccao titulo="7. Menores">
            <p>
              Para criar conta de adepto é preciso ter <strong>13 anos ou mais</strong>, ou autorização dos pais ou do
              tutor (artigo 16.º da Lei n.º 58/2019). No registo, a pessoa declara cumprir esta condição.
            </p>
            <p>
              Os nomes dos atletas aparecem sempre abreviados. Os pais ou tutores podem pedir a correção ou a remoção do
              nome de um atleta menor através de {EMAIL}.
            </p>
          </Seccao>

          <Seccao titulo="8. Cookies">
            <p>
              Usamos apenas cookies essenciais para manter a sessão de quem entra na conta. Não usamos cookies de
              publicidade, de rastreamento nem ferramentas de análise.
            </p>
          </Seccao>

          <Seccao titulo="9. Segurança">
            <ul className="list-disc list-inside space-y-2">
              <li>Ligação cifrada (HTTPS) em todo o site.</li>
              <li>Palavras-passe guardadas de forma cifrada.</li>
              <li>Regras de acesso na base de dados: cada pessoa só vê e altera o que lhe é permitido.</li>
              <li>Limite de tentativas de login e registo de acessos ao painel.</li>
            </ul>
            <p>
              Se houver uma violação de dados que represente risco para as pessoas, comunicamo-la à CNPD no prazo de 72
              horas e, quando for exigido, às pessoas afetadas.
            </p>
          </Seccao>

          <Seccao titulo="10. Alterações">
            <p>
              Se esta política mudar, atualizamos a data no topo desta página. Quando a alteração for relevante, avisamos
              no site.
            </p>
          </Seccao>

          <Seccao titulo="11. Reclamações">
            <p>
              Se considerares que os teus dados não foram tratados corretamente, podes apresentar queixa à Comissão
              Nacional de Proteção de Dados (CNPD) — <strong>www.cnpd.pt</strong>.
            </p>
          </Seccao>
        </div>
      </div>
    </div>
  );
}
