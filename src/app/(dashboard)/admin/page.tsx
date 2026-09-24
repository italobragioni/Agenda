import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentContext } from "@/features/auth/current";
import { isAdminEmail } from "@/features/admin/config";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminRowActions } from "@/features/admin/row-actions";
import { planStatusText } from "@/features/billing/plan-status";
import { planState, PLANS } from "@/features/billing/plan";
import { formatCents } from "@/lib/money";
import { formatDateBR } from "@/lib/datetime";
import type { Business } from "@/types/database";

export const metadata: Metadata = { title: "Administrador — Carvi" };

export default async function AdminPage() {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");
  if (!isAdminEmail(ctx.email)) notFound(); // esconde de quem não é admin

  const admin = createAdminClient();
  const tz = ctx.business.timezone;

  const [{ data: businessesData }, { data: profilesData }, usersRes] =
    await Promise.all([
      admin
        .from("businesses")
        .select(
          "id, name, slug, plan, trial_ends_at, paid_until, created_at",
        )
        .order("created_at", { ascending: false }),
      admin.from("profiles").select("id, business_id"),
      admin.auth.admin.listUsers({ perPage: 1000 }),
    ]);

  const businesses = (businessesData ?? []) as Business[];
  const profiles = (profilesData ?? []) as { id: string; business_id: string }[];

  // Mapa business_id -> email do dono.
  const userEmail = new Map<string, string>();
  for (const u of usersRes.data?.users ?? []) {
    if (u.id && u.email) userEmail.set(u.id, u.email);
  }
  const bizEmail = new Map<string, string>();
  for (const p of profiles) {
    const email = userEmail.get(p.id);
    if (email) bizEmail.set(p.business_id, email);
  }

  // Estatísticas.
  const now = new Date();
  let emTeste = 0;
  let pagantes = 0;
  let expirados = 0;
  let mrrCents = 0;
  for (const b of businesses) {
    const st = planState(b, now);
    if (!st.active) expirados += 1;
    else if (st.isTrial) emTeste += 1;
    else {
      pagantes += 1;
      mrrCents +=
        b.plan === "premium" ? PLANS.premium.priceCents : PLANS.basic.priceCents;
    }
  }

  const stats = [
    { label: "Cadastros", value: String(businesses.length) },
    { label: "Em teste", value: String(emTeste) },
    { label: "Pagantes", value: String(pagantes) },
    { label: "Expirados", value: String(expirados) },
    { label: "Receita/mês", value: formatCents(mrrCents) },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Administrador"
        description="Todos os estabelecimentos cadastrados na Carvi."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs font-medium text-muted">{s.label}</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      {businesses.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted">
          Nenhum cadastro ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {businesses.map((b) => {
            const st = planStatusText(b);
            return (
              <li key={b.id}>
                <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {b.name}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {bizEmail.get(b.id) ?? "—"} · /{b.slug}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      Cadastro: {formatDateBR(b.created_at, tz)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge
                        className={
                          st.tone === "danger"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : st.tone === "warn"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-brand-soft text-brand border-brand/30"
                        }
                      >
                        {st.title}
                      </Badge>
                      <p className="mt-1 text-[11px] text-muted">{st.detail}</p>
                    </div>
                    <AdminRowActions businessId={b.id} />
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
