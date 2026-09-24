import { redirect } from "next/navigation";
import { getCurrentContext } from "@/features/auth/current";
import { LogoutButton } from "@/features/auth/logout-button";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { BillingBanner } from "@/features/billing/billing-banner";
import { EstablishmentLogo } from "@/components/brand/logo";
import { isAdminEmail } from "@/features/admin/config";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  return (
    <div className="flex min-h-full">
      <Sidebar
        businessName={ctx.business.name}
        logoUrl={ctx.business.logo_url}
        isAdmin={isAdminEmail(ctx.email)}
        planFields={{
          plan: ctx.business.plan,
          trial_ends_at: ctx.business.trial_ends_at,
          paid_until: ctx.business.paid_until,
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <BillingBanner business={ctx.business} />

        {/* Cabeçalho — apenas no celular (no PC a sidebar já mostra o nome) */}
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
          <EstablishmentLogo
            logoUrl={ctx.business.logo_url}
            className="h-8 max-w-[150px]"
          />
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
