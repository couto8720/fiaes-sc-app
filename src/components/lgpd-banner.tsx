"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function LGPDBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verificar se utilizador já deu consentimento
    const hasConsent = localStorage.getItem("lgpd-consent");
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("lgpd-consent", JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
    }));
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("lgpd-consent", JSON.stringify({
      accepted: false,
      timestamp: new Date().toISOString(),
    }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 shadow-lg z-50">
      <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-1">🔒</span>
              <div>
                <h3 className="font-bold text-white mb-1">Proteção de Dados</h3>
                <p className="text-sm text-slate-300">
                  Utilizamos cookies essenciais e armazenamos dados conforme a{" "}
                  <Link href="/privacidade" className="text-blue-400 hover:text-blue-300 underline">
                    Política de Privacidade
                  </Link>
                  {" "}e{" "}
                  <Link href="/termos" className="text-blue-400 hover:text-blue-300 underline">
                    Termos de Serviço
                  </Link>
                  . Não vendemos dados a terceiros.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleDecline}
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
            >
              Rejeitar
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition font-semibold"
            >
              Aceitar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
