import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CarviLogo } from "@/components/brand/logo";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-slate-950 px-4 py-16">
      <div className="w-full max-w-md text-center">
        <CarviLogo className="mx-auto h-40" />
        <p className="mx-auto mt-2 max-w-sm text-slate-300">
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
          <Link
            href="/login"
            className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-white/25 text-base font-medium text-white transition-colors hover:bg-white/10"
          >
            Entrar
          </Link>
        </div>
      </div>
    </main>
  );
}
