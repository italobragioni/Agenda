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
  Star,
  MessageCircle,
} from "lucide-react";
import { CarviLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/features/billing/plan";
import { formatCents } from "@/lib/money";
import { SUPPORT_WHATSAPP_URL } from "@/lib/support";

export const metadata: Metadata = {
  title: "Carvi — Agendamento online para lava-jato e estética automotiva",
  description:
    "Seus clientes agendam sozinhos, 24h, por um link. Agenda organizada, sem furos e sem WhatsApp lotado. Teste 7 dias grátis, sem cartão.",
};

const CTA_HREF = "/cadastro";
const YEAR = new Date().getFullYear();

function Eyebrow({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
      {children}
    </span>
  );
}

/** Mockup do produto (a página pública de agendamento dentro de um celular). */
function HeroMockup() {
  return (
    <div className="relative mx-auto w-[260px]">
      <div className="rounded-[2.2rem] border-[10px] border-slate-900 bg-white shadow-2xl">
        <div className="rounded-[1.5rem] overflow-hidden">
          {/* topo */}
          <div className="flex flex-col items-center gap-1 bg-slate-50 px-4 pb-3 pt-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-xs font-bold text-white">
              EP
            </span>
            <p className="text-sm font-semibold text-foreground">
              Estética Premium
            </p>
            <p className="text-[11px] text-muted">Agende seu horário</p>
          </div>
          {/* serviço */}
          <div className="space-y-2 px-4 py-3">
            <div className="flex items-center justify-between rounded-xl border border-brand bg-brand-soft px-3 py-2">
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Lavagem Completa
                </p>
                <p className="text-[10px] text-muted">60 min</p>
              </div>
              <span className="text-xs font-bold text-brand">R$ 80</span>
            </div>
            {/* horários */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {["09:00", "10:00", "11:00", "14:00"].map((h, i) => (
                <span
                  key={h}
                  className={
                    i === 1
                      ? "rounded-md bg-brand py-1 text-center text-[10px] font-semibold text-white"
                      : "rounded-md border border-border py-1 text-center text-[10px] text-foreground"
                  }
                >
                  {h}
                </span>
              ))}
            </div>
            <div className="mt-1 rounded-lg bg-brand py-2 text-center text-[11px] font-semibold text-white">
              Confirmar agendamento
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <div className="flex min-h-full flex-col bg-white pb-20 sm:pb-0">
      {/* Barra superior */}
      <header className="sticky top-0 z-20 border-b border-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <CarviLogo className="h-8" transparent />
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
      <section className="relative overflow-hidden">
        {/* brilho de fundo */}
        <div
          className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-gradient-to-br from-cyan-300/40 to-brand/30 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:py-20 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <Eyebrow>Lava-jato & estética automotiva</Eyebrow>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
              Cada horário perdido no WhatsApp é{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-brand bg-clip-text text-transparent">
                dinheiro saindo do seu bolso.
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted sm:text-lg lg:mx-0">
              A Carvi organiza seus agendamentos e deixa seus clientes marcarem
              online, 24 horas por dia. Comece grátis por 7 dias — sem cartão.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 lg:items-start">
              <PrimaryCta>Quero minha agenda cheia</PrimaryCta>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted lg:justify-start">
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-brand" /> 7 dias grátis
                </span>
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-brand" /> Sem cartão
                </span>
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-brand" /> Pronto em 5 min
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <HeroMockup />
          </div>
        </div>
      </section>

      {/* FAIXA DE CONFIANÇA */}
      <section className="border-y border-border bg-slate-50">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-4 text-sm font-medium text-muted">
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4 text-brand" /> Agendamento 24 horas
          </span>
          <span className="inline-flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-brand" /> Sem instalar app
          </span>
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand" /> Sem conflito de horário
          </span>
          <span className="inline-flex items-center gap-2">
            <Wallet className="h-4 w-4 text-brand" /> A partir de R$ 9,90/mês
          </span>
        </div>
      </section>

      {/* DOR */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>O problema</Eyebrow>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Você já passou por isso?
          </h2>
        </div>
        <ul className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
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
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <X className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm text-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* SOLUÇÃO */}
      <section className="bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>A solução</Eyebrow>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
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
        </div>
        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
          {[
            { icon: Link2, t: "1. Compartilhe o link", d: "No status, na bio ou no grupo." },
            { icon: CalendarClock, t: "2. Cliente agenda", d: "Sozinho, 24h, sem baixar app." },
            { icon: Check, t: "3. Agenda organizada", d: "Sem furo, sem conflito." },
          ].map((s) => (
            <div
              key={s.t}
              className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm"
            >
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-brand-foreground">
                <s.icon className="h-6 w-6" />
              </span>
              <p className="mt-4 text-sm font-semibold text-foreground">{s.t}</p>
              <p className="mt-1 text-sm text-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Benefícios</Eyebrow>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            O que muda no seu dia a dia
          </h2>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
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
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <b.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{b.t}</p>
                <p className="mt-0.5 text-sm text-muted">{b.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PREÇOS */}
      <section className="bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Planos</Eyebrow>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Comece de graça. Depois, escolha seu plano.
          </h2>
          <p className="mt-3 text-muted">
            Menos que uma lavagem simples por mês. Cancele quando quiser.
          </p>

          <div className="mx-auto mt-10 grid max-w-2xl gap-5 sm:grid-cols-2">
            {/* Básico */}
            <div className="flex flex-col rounded-3xl border border-border bg-card p-6 text-left shadow-sm">
              <p className="text-sm font-semibold text-foreground">Básico</p>
              <p className="mt-2 text-4xl font-extrabold text-foreground">
                {formatCents(PLANS.basic.priceCents)}
                <span className="text-sm font-normal text-muted">/mês</span>
              </p>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                {PLANS.basic.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={CTA_HREF} className="mt-6">
                <Button variant="secondary" fullWidth>
                  Começar grátis
                </Button>
              </Link>
            </div>

            {/* Premium */}
            <div className="relative flex flex-col rounded-3xl bg-gradient-to-br from-cyan-400 to-brand p-[2px] shadow-lg">
              <div className="flex flex-1 flex-col rounded-[calc(1.5rem-2px)] bg-card p-6 text-left">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Premium</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-0.5 text-xs font-medium text-brand-foreground">
                    <Star className="h-3 w-3" /> Popular
                  </span>
                </div>
                <p className="mt-2 text-4xl font-extrabold text-foreground">
                  {formatCents(PLANS.premium.priceCents)}
                  <span className="text-sm font-normal text-muted">/mês</span>
                </p>
                <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                  {PLANS.premium.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-foreground"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={CTA_HREF} className="mt-6">
                  <Button fullWidth>Testar 7 dias grátis</Button>
                </Link>
              </div>
            </div>
          </div>
          <p className="mt-6 text-xs text-muted">
            Sem cartão no teste • Pagamento por cartão ou Pix depois
          </p>
        </div>
      </section>

      {/* GARANTIA */}
      <section className="px-4 py-16">
        <div className="mx-auto flex max-w-2xl items-start gap-4 rounded-3xl border border-brand/30 bg-brand-soft p-6 sm:p-8">
          <ShieldCheck className="h-10 w-10 shrink-0 text-brand" aria-hidden />
          <div>
            <h2 className="text-lg font-bold text-foreground sm:text-xl">
              Teste sem risco nenhum
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              7 dias grátis, sem pedir cartão. Você usa a Carvi com seus
              clientes de verdade antes de pagar qualquer centavo. Só continua
              se fizer sentido pro seu negócio.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <Eyebrow>Dúvidas</Eyebrow>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Perguntas frequentes
            </h2>
          </div>
          <div className="mt-8 space-y-2.5">
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
                className="group rounded-2xl border border-border bg-card p-4"
              >
                <summary className="tap flex cursor-pointer list-none items-center justify-between text-sm font-medium text-foreground">
                  {item.q}
                  <span className="ml-2 text-lg leading-none text-muted transition-transform group-open:rotate-45">
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
      <section className="relative overflow-hidden bg-slate-950 px-4 py-20 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-cyan-400/30 to-brand/30 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
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
            <a
              href={SUPPORT_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-green-400 hover:text-green-300"
            >
              <MessageCircle className="h-4 w-4" /> Tem dúvidas? Fale no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="border-t border-border bg-white px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <CarviLogo className="h-7" transparent />
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

      {/* CTA FIXO NO CELULAR */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 p-3 backdrop-blur sm:hidden">
        <Link href={CTA_HREF}>
          <Button fullWidth size="lg">
            Começar grátis por 7 dias
          </Button>
        </Link>
      </div>

      {/* BOTÃO FLUTUANTE DO WHATSAPP (acima da barra fixa no celular) */}
      <a
        href={SUPPORT_WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="wa-pulse tap fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 sm:bottom-6 sm:right-6"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}
