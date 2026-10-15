import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight, LogIn } from "lucide-react";
import { CarviLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pagamento confirmado — Carvi",
  description: "Seu acesso à Carvi foi liberado. Entre no seu aplicativo.",
};

/**
 * Página pública de boas-vindas após o pagamento (destino do redirecionamento
 * da Cakto). Funciona mesmo sem login: o botão leva ao app e, se necessário,
 * passa pela tela de login.
 */
export default function PagamentoConfirmadoPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <CarviLogo className="mx-auto mb-8 h-9" transparent />

        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-11 w-11" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Pagamento confirmado! 🎉
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
          Seu acesso à Carvi já está liberado. Agora é só entrar no seu
          aplicativo para começar a usar.
        </p>

        <div className="mt-8">
          <Link href="/inicio">
            <Button size="lg" fullWidth>
              Entrar no meu app
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
        </div>

        <div className="mt-5 rounded-2xl border border-border bg-card p-4 text-left">
          <p className="flex items-start gap-2 text-sm text-foreground">
            <LogIn className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
            <span>
              Entre com o <strong>mesmo e-mail e senha</strong> que você usou no
              cadastro. Se pedir para fazer login, é só usar esses dados.
            </span>
          </p>
        </div>

        <p className="mt-6 text-xs text-muted">
          Dica: no app, em <strong>Configurações → Instalar aplicativo</strong>,
          você pode adicionar o ícone da Carvi na tela inicial do celular.
        </p>
      </div>
    </main>
  );
}
