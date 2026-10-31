import type { Metadata, Viewport } from "next";
import { Inter, Teko } from "next/font/google";
import { Suspense } from "react";
import { Cabecalho, CabecalhoProvisorio } from "@/components/Cabecalho";
import { NavInferior, NavInferiorVista } from "@/components/NavInferior";
import { RegistarServiceWorker } from "@/components/RegistarServiceWorker";
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
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-4 pb-28">{children}</main>
        <Suspense fallback={<NavInferiorVista caminho={null} />}>
          <NavInferior />
        </Suspense>
        <RegistarServiceWorker />
      </body>
    </html>
  );
}
