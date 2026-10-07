import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
import { formatPhone, whatsappLink } from "@/lib/phone";
import { onboardingWhatsappMessage } from "@/lib/support";
import { cn } from "@/lib/utils";
import type { Business } from "@/types/database";

export const metadata: Metadata = { title: "Administrador — Carvi" };

type Filter = "todos" | "assinantes" | "expirados";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "assinantes", label: "Assinantes" },
  { key: "expirados", label: "Sem acesso" },
];

/** Assinante de verdade: plano pago ativo com assinatura confirmada (Cakto). */
function isPaidSubscriber(b: Business, now: Date): boolean {
  const st = planState(b, now);
  return (
    st.active &&
    (!!b.cakto_subscription_id || b.subscription_status === "active")
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ f?: string }>;
}) {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");
  if (!isAdminEmail(ctx.email)) notFound(); // esconde de quem não é admin

  const { f } = await searchParams;
  const filter: Filter =
    f === "assinantes" || f === "expirados" ? (f as Filter) : "todos";

  const admin = createAdminClient();
  const tz = ctx.business.timezone;

  const [{ data: businessesData }, { data: profilesData }, usersRes] =
    await Promise.all([
      admin
        .from("businesses")
        .select(
          "id, name, slug, phone, whatsapp, plan, trial_ends_at, paid_until, cakto_subscription_id, subscription_status, created_at, updated_at",
        )
        .order("created_at", { ascending: false }),
      admin.from("profiles").select("id, business_id, full_name"),
      admin.auth.admin.listUsers({ perPage: 1000 }),
    ]);

  const businesses = (businessesData ?? []) as Business[];
  const profiles = (profilesData ?? []) as {
    id: string;
    business_id: string;
    full_name: string | null;
  }[];

  // Mapa business_id -> email e nome do dono.
  const userEmail = new Map<string, string>();
  for (const u of usersRes.data?.users ?? []) {
    if (u.id && u.email) userEmail.set(u.id, u.email);
  }
  const bizEmail = new Map<string, string>();
  const bizOwnerName = new Map<string, string | null>();
  for (const p of profiles) {
    bizOwnerName.set(p.business_id, p.full_name);
    const email = userEmail.get(p.id);
    if (email) bizEmail.set(p.business_id, email);
  }

  // Estatísticas.
  const now = new Date();
  let semAcesso = 0;
  let assinantes = 0;
  let mrrCents = 0;
  for (const b of businesses) {
    const st = planState(b, now);
    if (!st.active) semAcesso += 1;
    else if (b.plan !== "trial") {
      mrrCents += PLANS[b.plan].priceCents;
    }
    if (isPaidSubscriber(b, now)) assinantes += 1;
  }

  const stats = [
    { label: "Cadastros", value: String(businesses.length) },
    { label: "Assinantes", value: String(assinantes) },
    { label: "Sem acesso", value: String(semAcesso) },
    { label: "Receita/mês", value: formatCents(mrrCents) },
  ];

  // Lista filtrada pela aba selecionada.
  let visible = businesses.filter((b) => {
    const st = planState(b, now);
    if (filter === "assinantes") return isPaidSubscriber(b, now);
    if (filter === "expirados") return !st.active;
    return true;
  });
  // Na aba de assinantes, mostra os mais recentes primeiro.
  if (filter === "assinantes") {
    visible = [...visible].sort((a, b) =>
      (b.updated_at ?? "").localeCompare(a.updated_at ?? ""),
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Administrador"
        description="Todos os estabelecimentos cadastrados na Carvi."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs font-medium text-muted">{s.label}</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Filtro */}
      <div className="mb-4 inline-flex flex-wrap rounded-xl border border-border bg-card p-1">
        {FILTERS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "todos" ? "/admin" : `/admin?f=${tab.key}`}
            className={cn(
              "tap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              filter === tab.key
                ? "bg-brand text-brand-foreground"
                : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted">
          {filter === "assinantes"
            ? "Nenhum assinante ainda."
            : "Nenhum estabelecimento nesta categoria."}
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((b) => {
            const st = planStatusText(b);
            const subscriber = isPaidSubscriber(b, now);
            const tel = b.whatsapp || b.phone;
            return (
              <li key={b.id}>
                <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/${b.id}`}
                      className="tap inline-flex max-w-full items-center gap-1 truncate text-sm font-semibold text-foreground hover:text-brand"
                    >
                      <span className="truncate">{b.name}</span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted" />
                    </Link>
                    <p className="truncate text-xs text-muted">
                      {bizEmail.get(b.id) ?? "—"} · /{b.slug}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {tel ? (
                        <a
                          href={whatsappLink(
                            tel,
                            onboardingWhatsappMessage(bizOwnerName.get(b.id)),
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-brand hover:underline"
                        >
                          {formatPhone(tel)}
                        </a>
                      ) : (
                        "Sem telefone"
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      Cadastro: {formatDateBR(b.created_at, tz)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-start gap-1 sm:items-end">
                      {subscriber && (
                        <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                          ✓ Assinante
                        </Badge>
                      )}
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
                      <p className="text-[11px] text-muted">{st.detail}</p>
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
