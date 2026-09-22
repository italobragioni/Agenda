import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-brand-foreground">
          <CalendarCheck className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Agenda
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-muted">
          Agendamento simples para lava-jatos, detalhamento e estética
          automotiva. Controle sua agenda, clientes e faturamento em um só
          lugar.
        </p>
        <div className="mx-auto mt-8 flex max-w-xs flex-col gap-3">
          <Link href="/cadastro">
            <Button fullWidth size="lg">
              Criar conta grátis
            </Button>
          </Link>
          <Link href="/login">
            <Button fullWidth size="lg" variant="secondary">
              Entrar
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
