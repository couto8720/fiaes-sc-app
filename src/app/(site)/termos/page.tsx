import Link from "next/link";
import { VERSAO_POLITICA } from "@/lib/politica";

export const metadata = {
  title: "Termos de Utilização | Fiães SC",
  description: "Condições de utilização do site e da aplicação do Fiães Sport Clube.",
};

const EMAIL = "admin@fiaes.pt";

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

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-slate-800 rounded-lg p-8 shadow-lg">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Voltar
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Termos de Utilização</h1>
          <p className="text-slate-400">Última atualização: {dataPorExtenso(VERSAO_POLITICA)}</p>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 space-y-6">
          <Seccao titulo="1. O que é este serviço">
            <p>
              O site e a aplicação do <strong>Fiães Sport Clube</strong> mostram o calendário, os resultados, os
              marcadores, as classificações e os torneios dos escalões do clube. O serviço é <strong>gratuito</strong>.
            </p>
            <p>
              Qualquer pessoa pode consultar o site sem conta. As contas de sócios e adeptos servem só para personalizar
              o site (por exemplo, seguir escalões). As contas do staff são criadas por convite do clube e dão acesso ao
              painel de gestão.
            </p>
          </Seccao>

          <Seccao titulo="2. Contas">
            <ul className="list-disc list-inside space-y-2">
              <li>
                Para criar conta de adepto é obrigatório ter <strong>13 anos ou mais</strong>. No registo pedimos a
                data de nascimento para o confirmar.
              </li>
              <li>Os dados que indicas devem ser verdadeiros. Cada conta é pessoal e não deve ser partilhada.</li>
              <li>Guarda a tua palavra-passe em segredo e avisa-nos se suspeitares de uso indevido da tua conta.</li>
              <li>Podes apagar a tua conta a qualquer momento em «A minha conta».</li>
            </ul>
          </Seccao>

          <Seccao titulo="3. Utilização correta">
            <p>Ao usar o serviço, comprometes-te a não:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>tentar aceder a contas, dados ou áreas a que não tens acesso;</li>
              <li>prejudicar o funcionamento do site (por exemplo, com ataques ou pedidos automáticos em massa);</li>
              <li>usar o serviço para fins ilegais ou para ofender, ameaçar ou enganar outras pessoas;</li>
              <li>fazer-te passar por outra pessoa.</li>
            </ul>
            <p>
              O staff compromete-se ainda a introduzir dados corretos e a respeitar a privacidade dos atletas, em especial
              dos menores.
            </p>
          </Seccao>

          <Seccao titulo="4. Suspensão de contas">
            <p>
              O clube pode suspender ou apagar contas que não cumpram estes termos. Quando for possível, avisamos antes e
              explicamos o motivo.
            </p>
          </Seccao>

          <Seccao titulo="5. Conteúdos">
            <p>
              O símbolo, o nome do clube e os conteúdos do site pertencem ao Fiães Sport Clube ou a quem lhes deu licença.
              Podes partilhar resultados e páginas do site, mas não podes usar o símbolo do clube de forma que sugira uma
              ligação oficial que não existe.
            </p>
          </Seccao>

          <Seccao titulo="6. Exatidão da informação">
            <p>
              O staff do clube introduz os resultados e as classificações com cuidado, mas pode haver erros ou atrasos. Os
              resultados oficiais são os das entidades organizadoras das competições (por exemplo, a associação de
              futebol). Se encontrares um erro, avisa-nos.
            </p>
          </Seccao>

          <Seccao titulo="7. Disponibilidade e responsabilidade">
            <p>
              Fazemos o possível para manter o serviço disponível, mas pode haver interrupções para manutenção ou por
              falhas técnicas. Podemos alterar ou terminar funcionalidades do serviço.
            </p>
            <p>
              Sendo um serviço gratuito, o clube não responde por prejuízos indiretos resultantes da sua utilização, nos
              limites permitidos pela lei. Esta limitação não se aplica a casos de dolo ou culpa grave, nem afasta os
              direitos que a lei te garante.
            </p>
          </Seccao>

          <Seccao titulo="8. Privacidade">
            <p>
              O tratamento dos dados pessoais está descrito na{" "}
              <Link href="/privacidade" className="text-blue-400 underline hover:text-blue-300">
                Política de Privacidade
              </Link>
              .
            </p>
          </Seccao>

          <Seccao titulo="9. Alterações a estes termos">
            <p>
              Se estes termos mudarem, atualizamos a data no topo desta página. Quando a alteração for relevante, avisamos
              no site.
            </p>
          </Seccao>

          <Seccao titulo="10. Lei aplicável e contacto">
            <p>
              Estes termos regem-se pela lei portuguesa. Em caso de litígio, procuramos primeiro uma solução por acordo.
            </p>
            <p>
              Para questões sobre estes termos, escreve para <strong>{EMAIL}</strong>.
            </p>
          </Seccao>
        </div>
      </div>
    </div>
  );
}
