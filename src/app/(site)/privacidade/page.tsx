import Link from "next/link";

export const metadata = {
  title: "Política de Privacidade | Fiães SC",
  description: "Política de privacidade e proteção de dados da aplicação Fiães SC",
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-slate-800 rounded-lg p-8 shadow-lg">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Voltar
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Política de Privacidade</h1>
          <p className="text-slate-400">Última atualização: 19 de Novembro de 2026</p>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Introdução</h2>
            <p>
              A Fiães SC ("nós", "nosso" ou "empresa") opera a aplicação web de gestão de torneios
              ("Serviço"). Esta página informa-o sobre as nossas políticas quanto à recolha, utilização
              e divulgação de dados pessoais quando utiliza o nosso Serviço e das opções que tem associadas
              a esse dados.
            </p>
            <p>
              Utilizamos os seus dados para fornecer e melhorar o Serviço. Ao utilizar o Serviço,
              concorda com a recolha e utilização de informações de acordo com esta política.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Dados Pessoais Recolhidos</h2>
            <p>Podemos recolher os seguintes dados pessoais:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Dados de Autenticação:</strong> Email e password (encriptados)</li>
              <li><strong>Dados de Perfil:</strong> Nome, função de utilizador</li>
              <li><strong>Dados de Torneios:</strong> Nomes de equipas, locais, datas</li>
              <li><strong>Dados de Jogadores:</strong> Nomes de jogadores/equipas</li>
              <li><strong>Dados Técnicos:</strong> Endereço IP, tipo de navegador, timestamps</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Base Legal para Processamento</h2>
            <p>Processamos dados com base em:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Contrato:</strong> Para fornecer os serviços solicitados</li>
              <li><strong>Consentimento:</strong> Quando obtém explicitamente</li>
              <li><strong>Obrigações Legais:</strong> Para cumprir requisitos legais</li>
              <li><strong>Interesses Legítimos:</strong> Para melhorar segurança e fraude</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Como Utilizamos os Seus Dados</h2>
            <p>Utilizamos os dados recolhidos para:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Fornecer, manter e melhorar o Serviço</li>
              <li>Processar transações e enviar notificações</li>
              <li>Responder aos seus pedidos e suporte ao cliente</li>
              <li>Detectar, prevenir e resolver problemas técnicos e fraude</li>
              <li>Cumprir obrigações legais e regulamentares</li>
              <li>Comunicações de segurança e atualizações importantes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Retenção de Dados</h2>
            <p>Retemos dados pessoais pelos períodos necessários para:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Fornecer o Serviço (duração da conta)</li>
              <li>Cumprir obrigações legais (mínimo 2 anos para auditoria)</li>
              <li>Resolver disputas (máximo 7 anos)</li>
            </ul>
            <p className="mt-4">
              <strong>Dados de Menores:</strong> Se a conta é de um menor (menores de 18 anos),
              os dados serão deletados imediatamente após cancelamento da conta ou aos 18 anos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Partilha de Dados</h2>
            <p>
              <strong>Não vendemos, alugamos nem divulgamos dados pessoais a terceiros,</strong>
              exceto em casos limitados:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Supabase:</strong> Plataforma de base de dados (see privacidade Supabase)</li>
              <li><strong>Requisição Legal:</strong> Se obrigado por lei</li>
              <li><strong>Consentimento Explícito:</strong> Quando obtém permissão</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Seus Direitos (LGPD/GDPR)</h2>
            <p>Tem o direito de:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Acesso:</strong> Solicitar cópia dos seus dados</li>
              <li><strong>Correção:</strong> Corrigir dados inexatos</li>
              <li><strong>Eliminação:</strong> "Direito ao esquecimento" (com exceções legais)</li>
              <li><strong>Restrição:</strong> Restringir processamento</li>
              <li><strong>Portabilidade:</strong> Receber dados em formato estruturado</li>
              <li><strong>Oposição:</strong> Opor-se a certos processamentos</li>
            </ul>
            <p className="mt-4">
              Para exercer estes direitos, contacte: <strong>privacidade@fiaes.pt</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Segurança dos Dados</h2>
            <p>
              Implementamos medidas técnicas e organizacionais para proteger dados:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Encriptação HTTPS para toda transmissão</li>
              <li>Senhas encriptadas (não legível)</li>
              <li>Acesso restrito a dados (autenticação obrigatória)</li>
              <li>Firewalls e proteção contra intrusão</li>
              <li>Backups regulares</li>
            </ul>
            <p className="mt-4">
              <strong>Aviso:</strong> Nenhum método é 100% seguro.
              Não podemos garantir segurança absoluta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Cookies e Rastreamento</h2>
            <p>
              <strong>Cookies:</strong> Utilizamos apenas cookies essenciais para sessão (autenticação).
              Não utilizamos cookies de rastreamento ou publicidade.
            </p>
            <p className="mt-2">
              <strong>Analytics:</strong> Podemos utilizar ferramentas de análise anónimas
              (sem rastreamento individual).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Dados de Menores</h2>
            <p>
              <strong>Se a aplicação envolve menores (menores de 18 anos):</strong>
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Requer consentimento parental/tutor explícito</li>
              <li>Dados são armazenados com protecção adicional</li>
              <li>Não são vendidos a terceiros</li>
              <li>São deletados aos 18 anos ou 2 anos após inactividade</li>
              <li>Pais/tutores podem solicitar acesso/deleção</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">11. Alterações a Esta Política</h2>
            <p>
              Podemos atualizar esta política ocasionalmente. Notificaremos de alterações
              significativas por email ou aviso destacado no Serviço.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">12. Contacto</h2>
            <p>
              Para questões sobre esta política ou exercer direitos, contacte:
            </p>
            <div className="bg-slate-700 p-4 rounded mt-4">
              <p><strong>Email:</strong> privacidade@fiaes.pt</p>
              <p><strong>Contacto Responsável:</strong> Responsável de Dados Pessoais</p>
              <p className="text-sm text-slate-400 mt-4">
                Responderemos num prazo de 30 dias úteis.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">13. Reclamações</h2>
            <p>
              Se considera que viámos esta política, pode apresentar queixa à autoridade
              de proteção de dados:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Portugal:</strong> CNPD (Comissão Nacional de Protecção de Dados)</li>
              <li><strong>UE:</strong> Autoridade de proteção de dados local</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
