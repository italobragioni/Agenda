import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  X,
  CalendarClock,
  Link2,
  ShieldCheck,
  Users,
  Smartphone,
  Clock,
  Sparkles,
  MessageSquareOff,
  ArrowRight,
  Star,
  MessageCircle,
  TrendingUp,
  CarFront,
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

/* ============================================================
   MOCKUPS — telas do app desenhadas (sem precisar de fotos reais)
   ============================================================ */

/** Moldura de celular reutilizável. */
function Phone({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative w-[250px] ${className}`}>
      <div className="rounded-[2.2rem] border-[10px] border-slate-900 bg-white shadow-2xl">
        <div className="overflow-hidden rounded-[1.5rem]">{children}</div>
      </div>
    </div>
  );
}

/** Tela 1: página pública de agendamento (o que o cliente vê). */
function BookingMockup() {
  return (
    <Phone>
      <div className="flex flex-col items-center gap-1 bg-slate-50 px-4 pb-3 pt-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-xs font-bold text-white">
          EP
        </span>
        <p className="text-sm font-semibold text-foreground">Estética Premium</p>
        <p className="text-[11px] text-muted">Agende seu horário</p>
      </div>
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
    </Phone>
  );
}

/** Tela 2: agenda do dono (o que você vê no painel). */
function AgendaMockup() {
  const items = [
    { h: "09:00", s: "Lavagem Completa", c: "João · Civic", on: true },
    { h: "10:00", s: "Polimento", c: "Marcos · HB20", on: true },
    { h: "11:00", s: "Higienização", c: "Ana · Corolla", on: false },
    { h: "14:00", s: "Lavagem Simples", c: "Rafa · Onix", on: true },
  ];
  return (
    <Phone>
      <div className="bg-slate-50 px-4 pb-2 pt-6">
        <p className="text-[11px] font-medium text-muted">Hoje, {YEAR}</p>
        <p className="text-sm font-bold text-foreground">Sua agenda</p>
      </div>
      <div className="space-y-1.5 px-3 py-3">
        {items.map((it) => (
          <div
            key={it.h}
            className="flex items-center gap-2 rounded-xl border border-border bg-white px-2.5 py-2"
          >
            <span className="w-9 shrink-0 text-[11px] font-bold text-brand">
              {it.h}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-foreground">
                {it.s}
              </p>
              <p className="truncate text-[10px] text-muted">{it.c}</p>
            </div>
            <span
              className={
                it.on
                  ? "flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
                  : "flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-600"
              }
            >
              {it.on ? (
                <Check className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
            </span>
          </div>
        ))}
      </div>
    </Phone>
  );
}

/** Tela 3: financeiro (faturamento e lucro). */
function FinanceMockup() {
  const bars = [40, 65, 30, 80, 55, 95, 70];
  return (
    <Phone>
      <div className="bg-slate-50 px-4 pb-2 pt-6">
        <p className="text-[11px] font-medium text-muted">Este mês</p>
        <p className="text-sm font-bold text-foreground">Financeiro</p>
      </div>
      <div className="space-y-3 px-3 py-3">
        <div className="grid grid-cols-2 gap-1.5">
          <div className="rounded-xl border border-border bg-white px-2.5 py-2">
            <p className="text-[9px] font-medium text-muted">Faturamento</p>
            <p className="text-[13px] font-bold text-foreground">R$ 8.420</p>
          </div>
          <div className="rounded-xl border border-border bg-white px-2.5 py-2">
            <p className="text-[9px] font-medium text-muted">Lucro</p>
            <p className="text-[13px] font-bold text-emerald-600">R$ 5.180</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-white p-2.5">
          <p className="mb-2 text-[9px] font-medium text-muted">Por dia</p>
          <div className="flex h-16 items-end justify-between gap-1">
            {bars.map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-t bg-brand"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </Phone>
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
            <BookingMockup />
          </div>
        </div>
      </section>

      {/* NÚMEROS / FAIXA DE CONFIANÇA */}
      <section className="border-y border-border bg-slate-950">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4">
          {[
            { n: "24h", l: "Agenda aberta" },
            { n: "0", l: "Horário duplicado" },
            { n: "5 min", l: "Para começar" },
            { n: "R$ 9,90", l: "Por mês" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-2xl font-extrabold text-white sm:text-3xl">
                {s.n}
              </p>
              <p className="mt-1 text-xs text-slate-400">{s.l}</p>
            </div>
          ))}
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

      {/* ANTES × DEPOIS */}
      <section className="bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>A virada de chave</Eyebrow>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            O antes e o depois da Carvi
          </h2>
        </div>
        <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
          {/* Antes */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-red-600">
              <X className="h-4 w-4" /> Sem a Carvi
            </p>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              {[
                "Responder cada cliente na mão, um por um",
                "Agenda no caderno ou na cabeça",
                "Cliente some porque não teve resposta",
                "Contas de cabeça, sem saber o lucro",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          {/* Depois */}
          <div className="rounded-3xl border border-brand/30 bg-brand-soft p-6">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
              <Check className="h-4 w-4" /> Com a Carvi
            </p>
            <ul className="mt-4 space-y-3 text-sm text-foreground">
              {[
                "Cliente agenda sozinho pelo seu link",
                "Agenda organizada e sincronizada",
                "Atende 24h, até quando a loja está fechada",
                "Faturamento e lucro na tela, em tempo real",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SOLUÇÃO / COMO FUNCIONA */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Como funciona</Eyebrow>
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
            {
              icon: Link2,
              t: "1. Compartilhe o link",
              d: "No status, na bio ou no grupo.",
            },
            {
              icon: CalendarClock,
              t: "2. Cliente agenda",
              d: "Sozinho, 24h, sem baixar app.",
            },
            {
              icon: Check,
              t: "3. Agenda organizada",
              d: "Sem furo, sem conflito.",
            },
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

      {/* VITRINE DE TELAS */}
      <section className="overflow-hidden bg-slate-950 px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
            Por dentro do app
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Tudo no seu celular, simples de usar
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Da página que o cliente vê até o seu financeiro. Feito pra quem não
            tem tempo a perder.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl items-start gap-10 sm:grid-cols-3 sm:gap-6">
          {[
            {
              mock: <BookingMockup />,
              t: "Página de agendamento",
              d: "Seu link com a sua marca. O cliente marca em segundos.",
            },
            {
              mock: <AgendaMockup />,
              t: "Sua agenda do dia",
              d: "Todos os horários e carros organizados numa tela.",
            },
            {
              mock: <FinanceMockup />,
              t: "Financeiro completo",
              d: "Faturamento, despesas e lucro sempre à mão.",
            },
          ].map((c) => (
            <div key={c.t} className="flex flex-col items-center text-center">
              <div className="scale-90 sm:scale-100">{c.mock}</div>
              <p className="mt-5 text-sm font-semibold text-white">{c.t}</p>
              <p className="mt-1 max-w-[220px] text-xs text-slate-400">{c.d}</p>
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
            {
              icon: CalendarClock,
              t: "Pare de perder cliente",
              d: "Ele agenda sozinho, 24h, até de madrugada.",
            },
            {
              icon: MessageSquareOff,
              t: "Chega de WhatsApp lotado",
              d: "O link responde por você.",
            },
            {
              icon: ShieldCheck,
              t: "Nunca mais horário duplicado",
              d: "O sistema simplesmente não deixa.",
            },
            {
              icon: CarFront,
              t: "Controle os boxes",
              d: "Diga quantos carros lava ao mesmo tempo.",
            },
            {
              icon: Sparkles,
              t: "Sua marca na frente",
              d: "Página de agendamento com a sua logo.",
            },
            {
              icon: TrendingUp,
              t: "Saiba seu lucro",
              d: "Faturamento, despesas e lucro na tela.",
            },
            {
              icon: Users,
              t: "Clientes organizados",
              d: "Histórico e WhatsApp de cada um.",
            },
            {
              icon: Smartphone,
              t: "Tudo no celular",
              d: "Simples até pra quem não é de tecnologia.",
            },
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
                  <p className="text-sm font-semibold text-foreground">
                    Premium
                  </p>
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
              {
                q: "Preciso instalar algum aplicativo?",
                a: "Não. Funciona no navegador, no celular ou no computador.",
              },
              {
                q: "Meus clientes precisam criar conta?",
                a: "Não. Eles só abrem seu link, escolhem o horário e confirmam.",
              },
              {
                q: "Quanto tempo pra começar a usar?",
                a: "Cerca de 5 minutos: cadastra os serviços, define os horários e pronto.",
              },
              {
                q: "Serve pra estética e detalhamento também?",
                a: "Sim. Lava-jato, estética automotiva e detalhamento.",
              },
              {
                q: "Como funciona o teste grátis?",
                a: "7 dias liberados na hora, sem cartão. Depois você escolhe Básico ou Premium.",
              },
              {
                q: "Quais as formas de pagamento?",
                a: "Cartão ou Pix. E você cancela quando quiser.",
              },
              {
                q: "Posso colocar a logo do meu negócio?",
                a: "Pode. Sua página de agendamento fica com a sua marca.",
              },
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
