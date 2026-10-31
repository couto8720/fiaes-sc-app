import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <div className="py-16 text-center">
      <p className="text-5xl font-black text-clube dark:text-destaque">404</p>
      <h1 className="mt-2 text-xl font-bold">Página não encontrada</h1>
      <p className="mt-1 text-suave">O jogo ou escalão que procuras não existe ou foi removido.</p>
      <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-xl bg-clube px-5 font-semibold text-clube-texto">
        Voltar ao início
      </Link>
    </div>
  );
}
