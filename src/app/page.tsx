import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CarviLogo } from "@/components/brand/logo";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-white px-4 py-16">
      <div className="w-full max-w-md text-center">
        <CarviLogo className="mx-auto h-28" />
        <p className="mx-auto mt-2 max-w-sm text-muted">
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
