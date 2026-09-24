import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  X,
  CalendarClock,
  Link2,
  ShieldCheck,
  Wallet,
  Users,
  Smartphone,
  Clock,
  Sparkles,
  MessageSquareOff,
  ArrowRight,
} from "lucide-react";
import { CarviLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/features/billing/plan";
import { formatCents } from "@/lib/money";

export const metadata: Metadata = {
  title: "Carvi — Agendamento online para lava-jato e estética automotiva",
  description:
    "Seus clientes agendam sozinhos, 24h, por um link. Agenda organizada, sem furos e sem WhatsApp lotado. Teste 7 dias grátis, sem cartão.",
};

const CTA_HREF = "/cadastro";
const YEAR = new Date().getFullYear();

function PrimaryCta({ children = "Começar grátis" }: { children?: string }) {
  return (
    <Link href={CTA_HREF}>
      <Button size="lg" fullWidth className="sm:w-auto">
        {children}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Button>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-white">
      {/* Barra superior */}
      <header className="sticky top-0 z-20 border-b border-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <CarviLogo className="h-8" />
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="tap rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-slate-100"
            >
              Entrar
            </Link>
            <Link href={CTA_HREF} className="hidden sm:block">
              <Button size="sm">Começar grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand">
            <Sparkles className="h-3.5 w-3.5" /> Feito para lava-jato e estética
            automotiva
          </span>
          <h1 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Cada horário perdido no WhatsApp é dinheiro saindo do seu bolso.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted sm:text-lg">
            A Carvi organiza seus agendamentos e deixa seus clientes marcarem
            online, 24 horas por dia. Comece grátis por 7 dias — sem cartão.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <PrimaryCta>Quero minha agenda cheia</PrimaryCta>
            <p className="text-xs text-muted">
              🚗 7 dias grátis • Sem cartão • Pronto em 5 minutos
            </p>
          </div>
        </div>
      </section>

      {/* DOR */}
      <section className="bg-slate-50 px-4 py-14">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">
            Você já passou por isso?
          </h2>
          <ul className="mx-auto mt-6 max-w-xl space-y-3">
            {[
              "Perdeu cliente porque demorou pra responder no WhatsApp",
              "Marcou dois carros no mesmo horário e passou vergonha",
              "Anotou no caderno e esqueceu o agendamento",
              "Ficou o dia todo preso no celular em vez de trabalhar",
              "Chegou no fim do mês sem saber quanto faturou",
              "Furo na agenda = box parado = prejuízo",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-border bg-white p-3"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <X className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Sua agenda trabalhando sozinha
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Você ganha um link próprio com a sua logo. O cliente escolhe o
            serviço, vê só os horários livres e confirma. O sistema{" "}
            <strong className="text-foreground">
              bloqueia conflito de horário sozinho
            </strong>{" "}
            — nada de dois carros no mesmo box.
          </p>
          <div className="mx-auto mt-8 grid max-w-xl gap-4 sm:grid-cols-3">
            {[
              { icon: Link2, t: "1. Compartilhe o link", d: "No status, na bio ou no grupo." },
              { icon: CalendarClock, t: "2. Cliente agenda", d: "Sozinho, 24h, sem baixar app." },
              { icon: Check, t: "3. Agenda organizada", d: "Sem furo, sem conflito." },
            ].map((s) => (
              <div key={s.t} className="rounded-2xl border border-border bg-card p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <s.icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-foreground">{s.t}</p>
                <p className="mt-1 text-xs text-muted">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="bg-slate-50 px-4 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            O que muda no seu dia a dia
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { icon: CalendarClock, t: "Pare de perder cliente", d: "Ele agenda sozinho, 24h, até de madrugada." },
              { icon: MessageSquareOff, t: "Chega de WhatsApp lotado", d: "O link responde por você." },
              { icon: ShieldCheck, t: "Nunca mais horário duplicado", d: "O sistema simplesmente não deixa." },
              { icon: Sparkles, t: "Sua marca na frente", d: "Página de agendamento com a sua logo." },
              { icon: Wallet, t: "Saiba quanto entra", d: "Faturamento do dia, semana e mês na tela." },
              { icon: Users, t: "Clientes organizados", d: "Histórico e WhatsApp de cada um." },
              { icon: Smartphone, t: "Tudo no celular", d: "Simples até pra quem não é de tecnologia." },
              { icon: Clock, t: "Comece hoje", d: "Pronto em minutos, sem instalar nada." },
            ].map((b) => (
              <div
                key={b.t}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground">
                  <b.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{b.t}</p>
                  <p className="mt-0.5 text-sm text-muted">{b.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREÇOS */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Comece de graça. Depois, escolha seu plano.
          </h2>
          <p className="mt-3 text-muted">
            Menos que uma lavagem simples por mês. Cancele quando quiser.
          </p>

          <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
            {/* Básico */}
            <div className="rounded-2xl border border-border bg-card p-6 text-left">
              <p className="text-sm font-semibold text-foreground">Básico</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {formatCents(PLANS.basic.priceCents)}
                <span className="text-sm font-normal text-muted">/mês</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {PLANS.basic.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium */}
            <div className="relative rounded-2xl border border-brand bg-card p-6 text-left ring-1 ring-brand">
              <span className="absolute -top-3 left-6 rounded-full bg-brand px-2.5 py-0.5 text-xs font-medium text-brand-foreground">
                Mais popular
              </span>
              <p className="text-sm font-semibold text-foreground">Premium</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {formatCents(PLANS.premium.priceCents)}
                <span className="text-sm font-normal text-muted">/mês</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {PLANS.premium.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            <PrimaryCta>Testar 7 dias grátis</PrimaryCta>
            <p className="text-xs text-muted">
              Sem cartão • Pagamento por cartão ou Pix depois do teste
            </p>
          </div>
        </div>
      </section>

      {/* GARANTIA */}
      <section className="bg-slate-50 px-4 py-14">
        <div className="mx-auto flex max-w-2xl items-start gap-4 rounded-2xl border border-brand/30 bg-brand-soft p-6">
          <ShieldCheck className="h-8 w-8 shrink-0 text-brand" aria-hidden />
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Teste sem risco nenhum
            </h2>
            <p className="mt-1 text-sm text-muted">
              7 dias grátis, sem pedir cartão. Você usa a Carvi com seus
              clientes de verdade antes de pagar qualquer centavo. Só continua
              se fizer sentido pro seu negócio.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Perguntas frequentes
          </h2>
          <div className="mt-6 space-y-2">
            {[
              { q: "Preciso instalar algum aplicativo?", a: "Não. Funciona no navegador, no celular ou no computador." },
              { q: "Meus clientes precisam criar conta?", a: "Não. Eles só abrem seu link, escolhem o horário e confirmam." },
              { q: "Quanto tempo pra começar a usar?", a: "Cerca de 5 minutos: cadastra os serviços, define os horários e pronto." },
              { q: "Serve pra estética e detalhamento também?", a: "Sim. Lava-jato, estética automotiva e detalhamento." },
              { q: "Como funciona o teste grátis?", a: "7 dias liberados na hora, sem cartão. Depois você escolhe Básico ou Premium." },
              { q: "Quais as formas de pagamento?", a: "Cartão ou Pix. E você cancela quando quiser." },
              { q: "Posso colocar a logo do meu negócio?", a: "Pode. Sua página de agendamento fica com a sua marca." },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-border bg-card p-4"
              >
                <summary className="tap flex cursor-pointer list-none items-center justify-between text-sm font-medium text-foreground">
                  {item.q}
                  <span className="ml-2 text-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-sm text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-slate-950 px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
            Sua agenda pode trabalhar por você a partir de hoje.
          </h2>
          <p className="mt-3 text-slate-300">
            Menos WhatsApp. Menos furo. Mais carro no box.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link href={CTA_HREF}>
              <Button size="lg">
                Começar grátis por 7 dias
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
            <p className="text-xs text-slate-400">
              Sem cartão • Pronto em 5 minutos • Cancela quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="border-t border-border bg-white px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <CarviLogo className="h-7" />
          <div className="flex items-center gap-4 text-sm text-muted">
            <Link href="/login" className="hover:text-foreground">
              Entrar
            </Link>
            <Link href="/cadastro" className="hover:text-foreground">
              Criar conta
            </Link>
          </div>
          <p className="text-xs text-muted">© {YEAR} Carvi</p>
        </div>
      </footer>
    </div>
  );
}
