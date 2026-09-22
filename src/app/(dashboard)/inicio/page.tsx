import type { Metadata } from "next";
import { getCurrentContext } from "@/features/auth/current";

export const metadata: Metadata = { title: "Início — Agenda" };

export default async function InicioPage() {
  const ctx = await getCurrentContext();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Olá, {ctx?.profile.full_name?.split(" ")[0]} 👋
      </h1>
      <p className="mt-2 text-muted">
        Seu painel completo (agenda do dia, faturamento e próximos clientes)
        será construído nas próximas etapas.
      </p>
    </div>
  );
}
