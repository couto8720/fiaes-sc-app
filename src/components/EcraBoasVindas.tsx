"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Download, LogIn, UserPlus } from "lucide-react";
import { pedirInstalacao, plataformaInstalar, subscrever as subscreverInstalar } from "./DicaInstalar";

const CHAVE = "boas-vindas-vista";
const EVENTO = "boas-vindas-mudou";

function subscreverVista(avisar: () => void) {
  window.addEventListener(EVENTO, avisar);
  return () => window.removeEventListener(EVENTO, avisar);
}
const lerVista = () => localStorage.getItem(CHAVE) === "1";

/**
 * Ecrã de boas-vindas na primeira visita: Entrar, Criar conta ou Instalar a app.
 * Depois de escolher (ou "Continuar sem conta") não volta a aparecer neste browser.
 */
export function EcraBoasVindas() {
  const caminho = usePathname();
  // No servidor conta como "já vista", para o ecrã só aparecer no browser.
  const vista = useSyncExternalStore(subscreverVista, lerVista, () => true);
  const plataforma = useSyncExternalStore(subscreverInstalar, plataformaInstalar, () => null);
  const [passosIos, setPassosIos] = useState(false);

  if (vista || caminho?.startsWith("/admin") || caminho?.startsWith("/conta") || caminho?.startsWith("/auth")) return null;

  function marcarVista() {
    localStorage.setItem(CHAVE, "1");
    window.dispatchEvent(new Event(EVENTO));
  }

  async function instalar() {
    if (plataforma === "ios") return setPassosIos(true);
    await pedirInstalacao();
    marcarVista();
  }

  const botao =
    "flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold transition active:scale-[0.98]";

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="boas-vindas-titulo" className="fixed inset-0 z-[60] overflow-y-auto bg-clube text-clube-texto">
      <div className="mx-auto flex min-h-full max-w-sm flex-col items-center justify-center px-6 py-10 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/simbolo-fiaes.png" alt="Símbolo do Fiães SC" width={106} height={128} className="mb-6 h-32 w-auto drop-shadow-lg" />
        <h1 id="boas-vindas-titulo" className="font-[family-name:var(--font-teko)] text-5xl font-semibold uppercase leading-none tracking-wide">
          Bem-vindo ao Fiães SC
        </h1>
        <p className="mt-3 text-sm opacity-90">Calendário, resultados e classificações de todos os escalões.</p>

        <div className="mt-10 flex w-full flex-col gap-3">
          <Link href="/conta" onClick={marcarVista} className={`${botao} bg-destaque text-black`}>
            <LogIn size={20} aria-hidden />
            Entrar
          </Link>
          <Link href="/conta/registo" onClick={marcarVista} className={`${botao} border-2 border-clube-texto/70 hover:bg-clube-texto/10`}>
            <UserPlus size={20} aria-hidden />
            Criar conta
          </Link>
          {plataforma && (
            <button type="button" onClick={instalar} className={`${botao} border-2 border-clube-texto/70 hover:bg-clube-texto/10`}>
              <Download size={20} aria-hidden />
              Instalar app
            </button>
          )}
          {passosIos && (
            <p className="rounded-xl bg-black/25 p-3 text-left text-sm">
              No iPhone: toca em <strong>Partilhar</strong> <span aria-hidden>⎋</span> na barra do Safari e depois em{" "}
              <strong>Adicionar ao ecrã principal</strong>.
            </p>
          )}
        </div>

        <button type="button" onClick={marcarVista} className="mt-8 text-sm font-semibold underline underline-offset-4 opacity-90 hover:opacity-100">
          Continuar sem conta
        </button>
      </div>
    </div>
  );
}
