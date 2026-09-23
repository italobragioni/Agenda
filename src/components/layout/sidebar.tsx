"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { navItems } from "@/features/navigation/nav-items";
import { CarviLogo } from "@/components/brand/logo";
import { PlanStatusChip } from "@/features/billing/plan-status";
import type { PlanFields } from "@/features/billing/plan";
import { cn } from "@/lib/utils";

export function Sidebar({
  businessName,
  planFields,
}: {
  businessName: string;
  planFields: PlanFields;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="border-b border-border px-5 py-4">
        <CarviLogo className="h-9" />
        <p className="mt-1 truncate text-xs text-muted">{businessName}</p>
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

      <div className="space-y-2 px-3 pb-4">
        <PlanStatusChip business={planFields} />
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
