"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { bottomNavLeft, bottomNavRight } from "@/features/navigation/nav-items";
import { cn } from "@/lib/utils";

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "tap relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs",
        active ? "text-brand" : "text-muted",
      )}
    >
      {/* indicador do item ativo (aparece no topo) */}
      <span
        className={cn(
          "absolute top-0 h-1 rounded-full bg-brand transition-all duration-300",
          active ? "w-8 opacity-100" : "w-0 opacity-0",
        )}
      />
      <Icon
        key={active ? "on" : "off"}
        className={cn(
          "h-5 w-5",
          active ? "nav-pop" : "transition-transform duration-200",
        )}
      />
      <span className="transition-colors">{label}</span>
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card md:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {bottomNavLeft.map((item) => (
          <NavLink key={item.href} {...item} active={isActive(item.href)} />
        ))}

        {/* Botão central destacado: Novo agendamento */}
        <div className="flex w-16 shrink-0 items-start justify-center">
          <Link
            href="/agenda/novo"
            aria-label="Novo agendamento"
            className="-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lg ring-4 ring-background transition-transform duration-200 hover:scale-105 active:rotate-90 active:scale-95"
          >
            <Plus className="h-7 w-7" />
          </Link>
        </div>

        {bottomNavRight.map((item) => (
          <NavLink key={item.href} {...item} active={isActive(item.href)} />
        ))}
      </div>
    </nav>
  );
}
