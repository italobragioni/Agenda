import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock, UserCog, Users } from "lucide-react";
import { requireActiveBusiness } from "@/features/billing/guard";
import { capabilitiesFor } from "@/features/billing/plan";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InviteForm } from "@/features/team/invite-form";
import { MemberRemoveButton } from "@/features/team/member-remove-button";
import type { Profile } from "@/types/database";

export const metadata: Metadata = { title: "Equipe — Carvi" };

export default async function EquipePage() {
  const ctx = await requireActiveBusiness();
  if (!ctx) redirect("/login");

  // Só o dono gerencia a equipe.
  if (ctx.profile.role !== "owner") redirect("/inicio");

  const hasTeam = capabilitiesFor(ctx.business).team;

  // Sem o recurso (não é Empresarial): mostra convite de upgrade.
  if (!hasTeam) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title="Equipe"
          description="Dê acesso à sua equipe para gerenciar a agenda."
        />
        <Card className="flex flex-col items-start gap-3 border-brand/30 bg-brand-soft sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground">
              <Lock className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Vários usuários é do plano Empresarial
              </p>
              <p className="text-xs text-muted">
                Crie logins para seus funcionários acessarem a agenda, clientes e
                serviços — cada um com a própria conta.
              </p>
            </div>
          </div>
          <Link href="/assinatura" className="shrink-0">
            <Button size="sm">Fazer upgrade</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Lista os membros do estabelecimento (dono + funcionários).
  const admin = createAdminClient();
  const { data: profilesData } = await admin
    .from("profiles")
    .select("id, full_name, role, created_at")
    .eq("business_id", ctx.business.id);

  const profiles = (profilesData ?? []) as Pick<
    Profile,
    "id" | "full_name" | "role" | "created_at"
  >[];

  const usersRes = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailById = new Map<string, string>();
  for (const u of usersRes.data?.users ?? []) {
    if (u.id && u.email) emailById.set(u.id, u.email);
  }

  // Dono primeiro, depois funcionários por nome.
  const members = [...profiles].sort((a, b) => {
    if (a.role !== b.role) return a.role === "owner" ? -1 : 1;
    return a.full_name.localeCompare(b.full_name);
  });

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Equipe"
        description="Crie acessos para seus funcionários."
      />

      <Card className="mb-5">
        <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Users className="h-4 w-4 text-muted" aria-hidden /> Membros (
          {members.length})
        </h2>
        <ul className="mt-3 divide-y divide-border">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                <UserCog className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {m.full_name}
                </p>
                <p className="truncate text-xs text-muted">
                  {emailById.get(m.id) ?? "—"}
                </p>
              </div>
              {m.role === "owner" ? (
                <Badge className="border-brand/30 bg-brand-soft text-brand">
                  Dono
                </Badge>
              ) : (
                <>
                  <Badge className="border-border bg-slate-50 text-slate-600">
                    Funcionário
                  </Badge>
                  <MemberRemoveButton userId={m.id} name={m.full_name} />
                </>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-1 text-sm font-semibold text-foreground">
          Adicionar funcionário
        </h2>
        <p className="mb-4 text-xs text-muted">
          Ele entra em <strong>carvi.online</strong> com o e-mail e a senha que
          você definir e já vê a agenda do seu negócio.
        </p>
        <InviteForm />
      </Card>
    </div>
  );
}
