import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentContext } from "@/features/auth/current";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Configuração inicial — Agenda" };

export default async function OnboardingPage() {
  const ctx = await getCurrentContext();

  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Vamos configurar sua agenda 🎉
      </h1>
      <p className="mt-2 text-muted">
        Sua conta e o estabelecimento <strong>{ctx?.business.name}</strong>{" "}
        foram criados com sucesso.
      </p>
      <p className="mt-2 text-sm text-muted">
        O passo a passo de configuração (primeiro serviço, horários e link
        público) será construído na próxima etapa.
      </p>
      <div className="mt-6">
        <Link href="/inicio">
          <Button>Ir para o início</Button>
        </Link>
      </div>
    </div>
  );
}
