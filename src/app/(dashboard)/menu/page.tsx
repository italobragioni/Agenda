import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { redirect } from "next/navigation";
import { navItems } from "@/features/navigation/nav-items";
import { logout } from "@/features/auth/actions";
import { getCurrentContext } from "@/features/auth/current";
import { isAdminEmail } from "@/features/admin/config";
import { PlanStatusCard } from "@/features/billing/plan-status";
import { PageHeader } from "@/components/ui/page-header";
import { SUPPORT_WHATSAPP_URL } from "@/lib/support";
import { LogOut, ShieldCheck, MessageCircle } from "lucide-react";

export const metadata: Metadata = { title: "Menu — Agenda" };

export default async function MenuPage() {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Menu" />

      <PlanStatusCard business={ctx.business} className="mb-4" />

      {isAdminEmail(ctx.email) && (
        <Link
          href="/admin"
          className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 hover:bg-slate-50"
        >
          <ShieldCheck className="h-5 w-5 text-brand" aria-hidden />
          <span className="flex-1 text-sm font-medium text-foreground">
            Administrador
          </span>
          <ChevronRight className="h-4 w-4 text-muted" aria-hidden />
        </Link>
      )}

      <nav className="overflow-hidden rounded-2xl border border-border bg-card">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="tap flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-b-0 hover:bg-slate-50"
          >
            <item.icon className="h-5 w-5 text-muted" aria-hidden />
            <span className="flex-1 text-sm font-medium text-foreground">
              {item.label}
            </span>
            <ChevronRight className="h-4 w-4 text-muted" aria-hidden />
          </Link>
        ))}
      </nav>

      <a
        href={SUPPORT_WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="tap mt-4 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 hover:bg-slate-50"
      >
        <MessageCircle className="h-5 w-5 text-green-600" aria-hidden />
        <span className="flex-1 text-sm font-medium text-foreground">
          Falar com o suporte
        </span>
        <span className="text-xs text-muted">WhatsApp</span>
      </a>

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
