"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Plus } from "lucide-react";
import { navItems } from "@/features/navigation/nav-items";
import { cn } from "@/lib/utils";

export function Sidebar({ businessName }: { businessName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
          <CalendarCheck className="h-4 w-4" aria-hidden />
        </span>
        <span className="truncate text-sm font-semibold text-foreground">
          {businessName}
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand text-brand-foreground"
                  : "text-muted hover:bg-slate-100 hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <Link
          href="/agenda/novo"
          className="flex items-center justify-center gap-2 rounded-xl bg-brand px-3 py-2.5 text-sm font-medium text-brand-foreground hover:bg-brand-hover"
        >
          <Plus className="h-5 w-5" aria-hidden />
          Novo agendamento
        </Link>
      </div>
    </aside>
  );
}
