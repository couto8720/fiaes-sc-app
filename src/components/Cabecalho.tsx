import Link from "next/link";
import { LogIn } from "lucide-react";
import { modoDemo, obterConfig } from "@/lib/dados";
import { SIMBOLO_LOCAL, simboloSrc } from "@/lib/simbolo";

const COR_HEX = /^#[0-9A-Fa-f]{6}$/;

function Barra({ nome, logo }: { nome: string; logo: string }) {
  return (
    <header className="sticky top-0 z-20 bg-clube text-clube-texto shadow-sm">
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- símbolo pequeno (incluído na app ou URL configurado) */}
          <img src={logo} alt={`Símbolo do ${nome}`} width={36} height={43} className="h-11 w-auto object-contain drop-shadow" />
          <span className="truncate text-lg font-bold tracking-tight">{nome}</span>
        </Link>
        {/* Conta de sócio/adepto (com link para o painel do staff na própria página). */}
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

export function CabecalhoProvisorio() {
  return <Barra nome="Fiães SC" logo={SIMBOLO_LOCAL} />;
}

export async function Cabecalho() {
  const config = await obterConfig();
  // As cores vêm da BD (só o super-admin as altera) e são validadas antes de entrarem no CSS.
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
      <Barra nome={config.nome_curto} logo={simboloSrc(config)} />
      {modoDemo && (
        <p className="bg-destaque px-4 py-1.5 text-center text-xs font-medium text-black">
          Modo demonstração: dados de exemplo. Configura o Supabase para ver os dados reais.
        </p>
      )}
    </>
  );
}
