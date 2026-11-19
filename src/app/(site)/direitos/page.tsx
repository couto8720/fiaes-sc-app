import Link from "next/link";

export const metadata = {
  title: "Direitos de Autor & Imagem | Fiães SC",
  description: "Política de direitos de autor, imagem e propriedade intelectual da Fiães SC",
};

export default function DireitosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-slate-800 rounded-lg p-8 shadow-lg">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Voltar
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Direitos de Autor & Imagem</h1>
          <p className="text-slate-400">Última atualização: 19 de Novembro de 2026</p>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Copyright & Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo, design, código e marca associados à Fiães SC e sua aplicação
              web são propriedade intelectual protegida de <strong>Fiães Sport Clube</strong>.
            </p>
            <p>
              <strong>© 2026 Fiães Sport Clube. Todos os direitos reservados.</strong>
            </p>
            <div className="bg-slate-700 p-4 rounded mt-4">
              <p className="font-semibold text-white mb-2">Propriedade protegida inclui:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Logo e marca visual</li>
                <li>Design e interface da aplicação</li>
                <li>Código-fonte da aplicação</li>
                <li>Conteúdo publicado (artigos, posts)</li>
                <li>Nomes e identidade visual</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Restrições de Uso</h2>
            <p>
              <strong>É PROIBIDO:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Copiar, reproduzir ou duplicar a aplicação</li>
              <li>Descompilar ou fazer engenharia reversa do código</li>
              <li>Usar logo ou marca sem autorização</li>
              <li>Publicar ou distribuir conteúdo sem permissão</li>
              <li>Revender acesso ou usar comercialmente</li>
              <li>Falsificar conteúdo como originário da Fiães SC</li>
            </ul>
            <p className="mt-4 text-red-300">
              <strong>Violações serão perseguidas legalmente.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Fotos de Jogadores & Direitos de Imagem</h2>

            <h3 className="text-xl font-bold text-white mt-6 mb-3">📸 Publicação de Imagem</h3>
            <p>
              Se a aplicação publicar fotos de jogadores ou participantes de eventos do clube:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Consentimento Obrigatório:</strong> Requer autorização explícita
                do fotografado antes de publicação
              </li>
              <li>
                <strong>Menores (menores de 18):</strong> Requer consentimento do progenitor/tutor,
                não apenas do menor
              </li>
              <li>
                <strong>Conformidade LGPD/GDPR:</strong> Processamento de imagem requer base legal
                documentada
              </li>
              <li>
                <strong>Duração:</strong> Imagem pode ser mantida enquanto consentimento for válido
              </li>
            </ul>

            <h3 className="text-xl font-bold text-white mt-6 mb-3">🚫 Direito ao Esquecimento</h3>
            <p>
              <strong>Qualquer pessoa tem o direito de solicitar remoção de sua imagem.</strong>
            </p>
            <p className="mt-4">
              Para remover sua imagem da aplicação:
            </p>
            <div className="bg-slate-700 p-4 rounded mt-2">
              <p><strong>1. Envie email para:</strong> privacidade@fiaes.pt</p>
              <p><strong>2. Incluindo:</strong></p>
              <ul className="list-disc list-inside ml-4 mt-2">
                <li>Descrição da imagem (data, evento, contexto)</li>
                <li>Seu nome completo e contacto</li>
                <li>Data de solicitação</li>
              </ul>
              <p className="mt-4"><strong>3. Prazo:</strong> Responderemos em 30 dias úteis</p>
              <p><strong>4. Resultado:</strong> Imagem será removida do acesso público</p>
            </div>

            <p className="mt-6 text-yellow-200 bg-yellow-900/30 p-4 rounded">
              <strong>⚠️ Aviso:</strong> Imagens em redes sociais ou outros sites
              estão fora do escopo desta aplicação. Contacte esse site diretamente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Conteúdo de Utilizadores</h2>
            <p>
              Quanto ao conteúdo que <strong>você</strong> cria na aplicação
              (torneios, resultados, dados):
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Sua Propriedade:</strong> Mantém a propriedade do conteúdo que cria
              </li>
              <li>
                <strong>Nossa Licença:</strong> Concede à Fiães SC permissão para usar
                o conteúdo para operar a aplicação
              </li>
              <li>
                <strong>Sem Venda:</strong> Não vendemos seu conteúdo a terceiros
              </li>
              <li>
                <strong>Deleção:</strong> Pode solicitar deleção de conteúdo que criou
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Responsabilidade de Conteúdo</h2>
            <p>
              <strong>Você é responsável por:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Ter direito legal para usar conteúdo que submete</li>
              <li>Não violar direitos de terceiros</li>
              <li>Obter consentimento necessário (imagens, nomes, etc)</li>
              <li>Cumprir leis aplicáveis (LGPD, GDPR, etc)</li>
            </ul>
            <p className="mt-4">
              <strong>Fiães SC não é responsável por conteúdo enviado por utilizadores.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Aviso de Marca</h2>
            <p>
              <strong>Fiães Sport Clube</strong>, o logo e todos os nomes, marcas e
              logótipos associados são marcas comerciais da Fiães SC.
            </p>
            <p className="mt-4">
              <strong>Sem autorização escrita explícita, é proibido:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Usar logo ou marca da Fiães SC</li>
              <li>Usar nome de forma a sugerir associação não autorizada</li>
              <li>Registar domínios ou nomes similares</li>
              <li>Usar em publicidade ou comercialmente</li>
            </ul>
            <p className="mt-4">
              Para autorização de uso de marca, contacte: <strong>admin@fiaes.pt</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Conformidade com Leis</h2>
            <p>
              Esta política está em conformidade com:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>LGPD (Lei Geral de Proteção de Dados) - Brasil/Portugal</li>
              <li>GDPR (Regulamento Geral de Proteção de Dados) - UE</li>
              <li>Lei de Propriedade Intelectual - Portugal</li>
              <li>Lei de Marca Registada - UE</li>
              <li>Leis de Privacidade Locais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Reclamações de Copyright</h2>
            <p>
              Se acredita que seus direitos de autor foram violados nesta aplicação:
            </p>
            <div className="bg-slate-700 p-4 rounded mt-4">
              <p className="font-semibold text-white mb-2">Envie para: admin@fiaes.pt</p>
              <p className="text-sm mb-4">Com informações:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Descrição do conteúdo copyrighted</li>
                <li>Localização na aplicação</li>
                <li>Prova de propriedade</li>
                <li>Seu contacto e assinatura</li>
              </ul>
              <p className="text-sm mt-4">Investigaremos dentro de 30 dias úteis.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Contacto</h2>
            <p>
              Para questões sobre direitos de autor, imagem ou marca:
            </p>
            <div className="bg-slate-700 p-4 rounded mt-4">
              <p><strong>Email:</strong> admin@fiaes.pt</p>
              <p><strong>Assunto:</strong> [Direitos de Autor / Imagem / Marca]</p>
              <p className="text-sm text-slate-400 mt-4">
                Responderemos num prazo de 30 dias úteis.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Alterações</h2>
            <p>
              Podemos alterar esta política ocasionalmente. Alterações significativas
              serão comunicadas por email ou aviso na aplicação.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
