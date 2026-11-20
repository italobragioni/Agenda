import {
  LayoutDashboard,
  Calendar,
  Users,
  Wrench,
  DollarSign,
  Settings,
  CreditCard,
  Share2,
  FileText,
  Menu as MenuIcon,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Todas as seções da área administrativa (usadas na sidebar e no menu). */
export const navItems: NavItem[] = [
  { href: "/inicio", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/orcamento", label: "Orçamento", icon: FileText },
  { href: "/servicos", label: "Serviços", icon: Wrench },
  { href: "/link", label: "Link de agendamento", icon: Share2 },
  { href: "/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/assinatura", label: "Assinatura", icon: CreditCard },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

/** Itens da barra inferior do celular (o botão + central é tratado à parte). */
export const bottomNavLeft: NavItem[] = [
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/clientes", label: "Clientes", icon: Users },
];

export const bottomNavRight: NavItem[] = [
  { href: "/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/menu", label: "Menu", icon: MenuIcon },
];

/** Seções liberadas para o funcionário (staff): só Agenda e Clientes. */
const STAFF_HREFS = new Set(["/agenda", "/clientes"]);

/** Itens de navegação visíveis conforme o papel (dono vê tudo). */
export function visibleNavItems(role: string): NavItem[] {
  return role === "staff"
    ? navItems.filter((i) => STAFF_HREFS.has(i.href))
    : navItems;
}

/** Barra inferior (direita): funcionário não vê Financeiro, só o Menu. */
export function visibleBottomRight(role: string): NavItem[] {
  return role === "staff"
    ? bottomNavRight.filter((i) => i.href === "/menu")
    : bottomNavRight;
}
