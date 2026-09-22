import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { navItems } from "@/features/navigation/nav-items";
import { logout } from "@/features/auth/actions";
import { PageHeader } from "@/components/ui/page-header";
import { LogOut } from "lucide-react";

export const metadata: Metadata = { title: "Menu — Agenda" };

export default function MenuPage() {
  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Menu" />

      <nav className="overflow-hidden rounded-2xl border border-border bg-card">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-b-0 hover:bg-slate-50"
          >
            <item.icon className="h-5 w-5 text-muted" aria-hidden />
            <span className="flex-1 text-sm font-medium text-foreground">
              {item.label}
            </span>
            <ChevronRight className="h-4 w-4 text-muted" aria-hidden />
          </Link>
        ))}
      </nav>

      <form action={logout} className="mt-4">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Sair da conta
        </button>
      </form>
    </div>
  );
}
