import Link from "next/link";

export const metadata = {
  title: "Termos de Serviço | Fiães SC",
  description: "Termos de serviço e condições de utilização da aplicação Fiães SC",
};

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-slate-800 rounded-lg p-8 shadow-lg">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Voltar
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Termos de Serviço</h1>
          <p className="text-slate-400">Última atualização: 19 de Novembro de 2026</p>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 space-y-6">
          <section>
            <div className="bg-red-900/30 border border-red-700 rounded p-4 mb-6">
              <p className="text-red-200">
                <strong>⚠️ AVISO IMPORTANTE:</strong> Ao utilizar este Serviço, concorda com
                todos os termos e condições descritos abaixo. Se não concorda, não utilize o Serviço.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Definições e Interpretação</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>"Serviço":</strong> Aplicação web de gestão de torneios Fiães SC</li>
              <li><strong>"Utilizador":</strong> Qualquer pessoa com acesso ao Serviço</li>
              <li><strong>"Empresa" / "Nós":</strong> Fiães SC</li>
              <li><strong>"Conta":</strong> Registo único de utilizador no Serviço</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Aceitação dos Termos</h2>
            <p>
              Ao aceder e utilizar o Serviço, aceita estar vinculado por estes Termos.
              Se não concorda com qualquer parte destes Termos, não deverá utilizar o Serviço.
            </p>
            <p>
              <strong>Idade Mínima:</strong> Se tem menos de 18 anos, necessita consentimento
              do progenitor/tutor. Ao criar uma conta, confirma ter 18+ anos ou consentimento parental.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Uso Aceitável</h2>
            <p>Concorda em não utilizar o Serviço para:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Violar leis ou regulamentos aplicáveis</li>
              <li>Infringir direitos intelectuais de terceiros</li>
              <li>Publicar conteúdo obsceno, ofensivo ou difamatório</li>
              <li>Assédio, abuso ou ameaças a outros utilizadores</li>
              <li>Hacking, virus ou malware</li>
              <li>Spamming ou comunicações não solicitadas</li>
              <li>Falsificar identidade</li>
              <li>Fins comerciais não autorizados</li>
              <li>Acesso não autorizado a dados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Conta de Utilizador</h2>
            <p><strong>Responsabilidades:</strong></p>
            <ul className="list-disc list-inside space-y-2">
              <li>Manter sigilo de password</li>
              <li>Responsável por todas as atividades na sua conta</li>
              <li>Notificar-nos de acesso não autorizado imediatamente</li>
              <li>Fornecer informações precisas e atualizadas</li>
              <li>Uma conta por pessoa (proibido partilhar)</li>
            </ul>
            <p className="mt-4">
              <strong>Encerramento:</strong> Podemos encerrar contas que violem estes Termos,
              sem pré-aviso ou reembolso.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Propriedade Intelectual</h2>
            <p>
              <strong>Propriedade da Empresa:</strong> Todo conteúdo, funcionalidade e design
              do Serviço são propriedade da Fiães SC ou seus fornecedores e estão protegidos
              por direitos de autor internacionais.
            </p>
            <p className="mt-4">
              <strong>Sua Propriedade:</strong> Mantém a propriedade do conteúdo que cria
              (torneios, resultados). Concede à Fiães SC licença para utilizar para operar o Serviço.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Isenção de Responsabilidade - IMPORTANTE</h2>
            <div className="bg-yellow-900/30 border border-yellow-700 rounded p-4">
              <p className="text-yellow-200 font-bold mb-2">🔴 LEIA COM ATENÇÃO:</p>
              <ul className="list-disc list-inside space-y-2 text-yellow-200">
                <li>
                  <strong>Sem Garantia de Precisão:</strong> Os resultados, classificações
                  e dados fornecidos SÃO FORNECIDOS "COMO ESTÃO" sem qualquer garantia de precisão.
                </li>
                <li>
                  <strong>Responsabilidade do Utilizador:</strong> É responsável por verificar
                  a exactidão de todos os dados introduzidos.
                </li>
                <li>
                  <strong>Erros de Dados:</strong> Embora nos esforcemos por precisão,
                  podem ocorrer erros. A Fiães SC não é responsável por consequências de erros.
                </li>
                <li>
                  <strong>Uso Interno:</strong> Este Serviço é para uso administrativo interno.
                  Não substitui árbitros ou decisões desportivas oficiais.
                </li>
                <li>
                  <strong>Nenhuma Garantia Expressa ou IMPLÍCITA:</strong> Incluindo de COMERCIABILIDADE,
                  ADEQUAÇÃO PARA FIM ESPECÍFICO OU NÃO VIOLAÇÃO.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Limitação de Responsabilidade</h2>
            <p>
              <strong>Em nenhuma circunstância</strong> a Fiães SC será responsável por:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Danos indirectos, incidentais, especiais ou consequentes</li>
              <li>Perda de lucros, dados ou receita</li>
              <li>Erros ou omissões em dados</li>
              <li>Tempo de inactividade ou falta de acesso</li>
              <li>Comportamento de terceiros</li>
            </ul>
            <p className="mt-4">
              <strong>Limite Máximo:</strong> Nossa responsabilidade total não excederá
              o valor pago por utilização do Serviço nos últimos 12 meses (ou €0 se gratuito).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Disponibilidade do Serviço</h2>
            <p>
              <strong>Sem Garantia de Disponibilidade:</strong> Não garantimos disponibilidade
              contínua. O Serviço pode estar indisponível para manutenção, atualizações ou
              circunstâncias imprevistas.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Manutenção sem pré-aviso para segurança/estabilidade</li>
              <li>Poder encerrar o Serviço a qualquer altura</li>
              <li>Sem responsabilidade por indisponibilidade</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Alteração dos Termos</h2>
            <p>
              Podemos alterar estes Termos a qualquer altura. As alterações tornam-se efetivas
              quando publicadas. A utilização contínua do Serviço implica aceitação das
              alterações.
            </p>
            <p>
              Recomendamos rever periodicamente estes Termos para alterações.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Encerramento</h2>
            <p><strong>Podemos encerrar acesso ao Serviço:</strong></p>
            <ul className="list-disc list-inside space-y-2">
              <li>Se violar estes Termos</li>
              <li>Por comportamento abusivo ou ilegal</li>
              <li>Por inactividade prolongada (6+ meses)</li>
              <li>Por qualquer razão com 30 dias de aviso</li>
            </ul>
            <p className="mt-4">
              <strong>Sem Reembolso:</strong> Encerramento não dá direito a reembolso.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">11. Direito de Acesso e Uso</h2>
            <p>
              Concede-lhe licença limitada, não-exclusiva para aceder e utilizar o Serviço
              para fins pessoais e não comerciais.
            </p>
            <p>
              <strong>Proibições:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Não copiar ou replicar o Serviço</li>
              <li>Não descompilar ou fazer engenharia reversa</li>
              <li>Não revender ou distribuir acesso</li>
              <li>Não scraping ou coleta de dados em massa</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">12. Lei Aplicável</h2>
            <p>
              Estes Termos são regidos pela Lei Portuguesa e pelas leis da União Europeia
              (nomeadamente RGPD e LGPD).
            </p>
            <p>
              Qualquer disputa será resolvida através de conciliação ou, se necessário,
              nos tribunais portugueses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">13. Contato</h2>
            <p>
              Para questões sobre estes Termos:
            </p>
            <div className="bg-slate-700 p-4 rounded mt-4">
              <p><strong>Email:</strong> admin@fiaes.pt</p>
              <p><strong>Contacto:</strong> Fiães Sport Club</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">14. Declaração de Conformidade</h2>
            <p>
              Ao criar uma conta ou utilizar o Serviço, confirma:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>✅ Ter 18+ anos ou consentimento parental</li>
              <li>✅ Ter lido e compreendido estes Termos</li>
              <li>✅ Concordar com estas Termos e Condições</li>
              <li>✅ Concordar com a Política de Privacidade</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
