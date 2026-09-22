import { redirect } from "next/navigation";
import { getCurrentContext } from "@/features/auth/current";
import { LogoutButton } from "@/features/auth/logout-button";
import { CalendarCheck } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
            <CalendarCheck className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-sm font-semibold text-foreground">
            {ctx.business.name}
          </span>
        </div>
        <LogoutButton />
      </header>
      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
