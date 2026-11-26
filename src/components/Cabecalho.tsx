import Link from "next/link";
import { Suspense } from "react";
import { LogIn, Settings } from "lucide-react";
import { modoDemo, obterConfig } from "@/lib/dados";
import { SIMBOLO_LOCAL, simboloSrc } from "@/lib/simbolo";
import { exigirSessao } from "@/lib/sessao";
import { BotaoMenuSite } from "./BotaoMenuSite";

const COR_HEX = /^#[0-9A-Fa-f]{6}$/;

export function CabecalhoProvisorio() {
  return (
    <header className="cabecalho-clube sticky top-0 z-20 bg-clube text-clube-texto">
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4 md:max-w-none md:px-6">
        {/* Lê o URL: tem de ficar dentro de Suspense (pré-render do Next). */}
        <Suspense fallback={null}>
          <BotaoMenuSite />
        </Suspense>
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <img src={SIMBOLO_LOCAL} alt="Símbolo do Fiães SC" width={36} height={43} className="h-11 w-auto object-contain drop-shadow" />
          <span className="truncate pt-1 font-display text-2xl leading-none font-semibold uppercase tracking-wide">Fiães SC</span>
        </Link>
        <Link
          href="/conta"
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-clube-texto/40 px-3 py-1.5 text-sm font-semibold hover:bg-clube-texto/10"
        >
          <LogIn size={16} aria-hidden />
          Entrar
        </Link>
      </div>
    </header>
  );
}

export async function Cabecalho() {
  const config = await obterConfig();
  const sessao = await exigirSessao().catch(() => null);

  const cores = [
    ["--cor-primaria", config.cor_primaria],
    ["--cor-secundaria", config.cor_secundaria],
    ["--cor-destaque", config.cor_destaque],
  ]
    .filter(([, v]) => COR_HEX.test(v))
    .map(([k, v]) => `${k}:${v}`)
    .join(";");

  return (
    <>
      <style>{`:root{${cores}}`}</style>
      <header className="cabecalho-clube sticky top-0 z-20 bg-clube text-clube-texto">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4 md:max-w-none md:px-6">
          {/* Lê o URL: tem de ficar dentro de Suspense (pré-render do Next). */}
          <Suspense fallback={null}>
            <BotaoMenuSite />
          </Suspense>
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <img src={simboloSrc(config)} alt={`Símbolo do ${config.nome_curto}`} width={36} height={43} className="h-11 w-auto object-contain drop-shadow" />
            <span className="truncate pt-1 font-display text-2xl leading-none font-semibold uppercase tracking-wide">{config.nome_curto}</span>
          </Link>
          {sessao ? (
            <Link
              href="/admin/manual"
              className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-clube-texto/40 px-3 py-1.5 text-sm font-semibold hover:bg-clube-texto/10"
            >
              <Settings size={16} aria-hidden />
              Painel
            </Link>
          ) : (
            <Link
              href="/conta"
              className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-clube-texto/40 px-3 py-1.5 text-sm font-semibold hover:bg-clube-texto/10"
            >
              <LogIn size={16} aria-hidden />
              Entrar
            </Link>
          )}
        </div>
      </header>
      {modoDemo && (
        <p className="bg-destaque px-4 py-1.5 text-center text-xs font-medium text-black">
          Modo demonstração: dados de exemplo. Configura o Supabase para ver os dados reais.
        </p>
      )}
    </>
  );
}
