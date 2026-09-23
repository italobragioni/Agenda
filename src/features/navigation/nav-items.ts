import {
  LayoutDashboard,
  Calendar,
  Users,
  Wrench,
  DollarSign,
  Settings,
  CreditCard,
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
  { href: "/servicos", label: "Serviços", icon: Wrench },
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
