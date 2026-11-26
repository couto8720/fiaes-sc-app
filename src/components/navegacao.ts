import { CalendarDays, House, ListOrdered, Shield, Trophy, Zap, type LucideIcon } from "lucide-react";

/** Secções do site público (menu lateral em computador e menu deslizante no telemóvel). */
export const ITENS_NAVEGACAO: { href: string; rotulo: string; Icone: LucideIcon }[] = [
  { href: "/", rotulo: "Início", Icone: House },
  { href: "/calendario", rotulo: "Calendário", Icone: CalendarDays },
  { href: "/resultados", rotulo: "Resultados", Icone: Trophy },
  { href: "/classificacao", rotulo: "Classificação", Icone: ListOrdered },
  { href: "/torneios", rotulo: "Torneios", Icone: Zap },
  { href: "/clube", rotulo: "Fiães SC", Icone: Shield },
];

/** Evento que o botão ☰ do cabeçalho (telemóvel) envia para abrir o menu deslizante. */
export const EVENTO_ABRIR_MENU = "site-menu-abrir";

export const itemAtivo = (href: string, caminho: string | null) =>
  href === "/" ? caminho === "/" : Boolean(caminho?.startsWith(href));
