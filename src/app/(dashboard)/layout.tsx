import { redirect } from "next/navigation";
import { CalendarCheck } from "lucide-react";
import { getCurrentContext } from "@/features/auth/current";
import { LogoutButton } from "@/features/auth/logout-button";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { BillingBanner } from "@/features/billing/billing-banner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  return (
    <div className="flex min-h-full">
      <Sidebar businessName={ctx.business.name} />

      <div className="flex min-w-0 flex-1 flex-col">
        <BillingBanner business={ctx.business} />

        {/* Cabeçalho — apenas no celular (no PC a sidebar já mostra o nome) */}
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground">
              <CalendarCheck className="h-4 w-4" aria-hidden />
            </span>
            <span className="truncate text-sm font-semibold text-foreground">
              {ctx.business.name}
            </span>
          </div>
          <LogoutButton />
        </header>

        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:pb-8">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
