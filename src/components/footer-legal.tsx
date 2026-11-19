import Link from "next/link";

export function FooterLegal() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 border-t border-slate-700 mt-12 py-8 px-4 sm:px-6 lg:px-8 text-slate-400 text-sm">
      <div className="max-w-4xl mx-auto">
        {/* Aviso de Responsabilidade */}
        <div className="mb-6 pb-6 border-b border-slate-700">
          <h3 className="font-bold text-white mb-2">⚠️ Aviso de Responsabilidade</h3>
          <p>
            Os resultados, classificações e dados fornecidos nesta aplicação são fornecidos "COMO ESTÃO"
            sem qualquer garantia de precisão. A Fiães SC não é responsável por erros em dados ou
            suas consequências. Esta aplicação é para fins administrativos internos e não substitui
            árbitros ou decisões desportivas oficiais.
          </p>
        </div>

        {/* Aviso de Imagem e LGPD */}
        <div className="mb-6 pb-6 border-b border-slate-700">
          <h3 className="font-bold text-white mb-2">📸 Direitos de Imagem e Privacidade</h3>
          <p className="mb-2">
            Se esta aplicação publicar fotos de jogadores ou participantes:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Requer consentimento explícito para publicação de imagem</li>
            <li>Menores (menores de 18 anos) necessitam consentimento parental</li>
            <li>Direito a solicitar remoção de imagem (LGPD/GDPR)</li>
            <li>Contacte: privacidade@fiaes.pt para remover imagem</li>
          </ul>
        </div>

        {/* Copyright & Propriedade Intelectual */}
        <div className="mb-6 pb-6 border-b border-slate-700">
          <h3 className="font-bold text-white mb-2">© Propriedade Intelectual</h3>
          <p className="mb-2">
            &copy; {currentYear} <strong>Fiães Sport Clube</strong>. Todos os direitos reservados.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Design, código e marca são propriedade da Fiães SC</li>
            <li>Uso não autorizado é proibido (ver Termos de Serviço)</li>
            <li>Conteúdo de utilizador mantém propriedade do criador</li>
            <li>Fiães SC tem licença para usar conteúdo para operar a aplicação</li>
          </ul>
        </div>

        {/* Links Legais */}
        <div className="mb-6 pb-6 border-b border-slate-700">
          <h3 className="font-bold text-white mb-2">📋 Documentos Legais</h3>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacidade" className="text-blue-400 hover:text-blue-300 hover:underline">
              Política de Privacidade
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/termos" className="text-blue-400 hover:text-blue-300 hover:underline">
              Termos de Serviço
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/direitos" className="text-blue-400 hover:text-blue-300 hover:underline">
              Direitos de Autor & Imagem
            </Link>
            <span className="text-slate-600">|</span>
            <a href="mailto:privacidade@fiaes.pt" className="text-blue-400 hover:text-blue-300 hover:underline">
              Contacto Privacidade
            </a>
          </div>
        </div>

        {/* Aviso Desportivo */}
        <div className="mb-6 pb-6 border-b border-slate-700">
          <h3 className="font-bold text-white mb-2">⚽ Conformidade Desportiva</h3>
          <p>
            Esta aplicação é um instrumento administrativo para gestão de torneios.
            Decisões desportivas oficiais são responsabilidade dos árbitros e organismos
            desportivos competentes, não da aplicação.
          </p>
        </div>

        {/* Contacto & Reclamações */}
        <div className="mb-6">
          <h3 className="font-bold text-white mb-2">📞 Contacto & Reclamações</h3>
          <div className="space-y-1">
            <p><strong>Email Geral:</strong> admin@fiaes.pt</p>
            <p><strong>Privacidade/GDPR:</strong> privacidade@fiaes.pt</p>
            <p><strong>Reclamações:</strong> Contacte autoridade local de proteção de dados</p>
          </div>
        </div>

        {/* Footer Final */}
        <div className="text-center pt-6 border-t border-slate-700">
          <p className="text-xs text-slate-500">
            &copy; {currentYear} Fiães Sport Clube. Todos os direitos reservados. |
            Versão 0.1.0 (Beta) |
            Última atualização: Novembro de 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
