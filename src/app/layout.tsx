import type { Metadata, Viewport } from "next";
import { Inter, Teko } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { Cabecalho, CabecalhoProvisorio } from "@/components/Cabecalho";
import { MenuLateralSite } from "@/components/MenuLateralSite";
import { EcraBoasVindas } from "@/components/EcraBoasVindas";
import { RegistarServiceWorker } from "@/components/RegistarServiceWorker";
import { LGPDBanner } from "@/components/lgpd-banner";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
// Teko: fonte desportiva dos títulos e dos marcadores.
const teko = Teko({ variable: "--font-teko", subsets: ["latin"], weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: { default: "Fiães Sport Clube", template: "%s · Fiães SC" },
  description: "Calendário, resultados, marcadores e classificações de todos os escalões do Fiães Sport Clube.",
  icons: {
    icon: [{ url: "/icones/favicon", type: "image/png", sizes: "48x48" }, { url: "/icones/192", type: "image/png", sizes: "192x192" }],
    apple: [{ url: "/icones/apple", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  // iPhone: abre em ecrã inteiro quando instalada no ecrã principal.
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Fiães SC" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#006633",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-PT" className={`${inter.variable} ${teko.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Suspense fallback={<CabecalhoProvisorio />}>
          <Cabecalho />
        </Suspense>
        <div className="flex flex-1">
          {/* Menu lateral do site (computador fixo; telemóvel desliza com o ☰ do cabeçalho). Não aparece no painel. */}
          <Suspense fallback={null}>
            <MenuLateralSite />
          </Suspense>
          {/* Site público: até ~1000px em computador. Painel (data-painel): largura toda, sem margens. */}
          <main className="group/main mx-auto w-full min-w-0 max-w-2xl flex-1 px-4 pt-4 pb-8 md:max-w-5xl md:px-6 has-[[data-painel]]:max-w-none has-[[data-painel]]:p-0 md:has-[[data-painel]]:p-0">
          {children}
          {/* Rodapé discreto */}
          <footer className="mt-10 border-t border-borda pt-4 text-center text-xs text-suave group-has-[[data-painel]]/main:hidden">
            <Link href="/privacidade" className="font-semibold hover:underline">
              Privacidade
            </Link>
            <span aria-hidden> · </span>© Fiães Sport Clube
          </footer>
          </main>
        </div>
        {/* Primeira visita: Entrar, Criar conta ou Instalar (lê o URL, por isso dentro de Suspense). */}
        <Suspense fallback={null}>
          <EcraBoasVindas />
        </Suspense>
        <RegistarServiceWorker />
        <LGPDBanner />
      </body>
    </html>
  );
}
