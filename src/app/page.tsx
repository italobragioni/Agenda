import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Check,
  X,
  CalendarClock,
  Link2,
  ShieldCheck,
  Users,
  Smartphone,
  Sparkles,
  MessageSquareOff,
  ArrowRight,
  Star,
  MessageCircle,
  TrendingUp,
  CarFront,
} from "lucide-react";
import { CarviLogo } from "@/components/brand/logo";
import { WistiaVsl } from "@/components/marketing/wistia-vsl";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/features/billing/plan";
import { formatCents } from "@/lib/money";
import { SUPPORT_WHATSAPP_URL } from "@/lib/support";

export const metadata: Metadata = {
  title: "Carvi — Agendamento online para lava-jato e estética automotiva",
  description:
    "Seus clientes agendam sozinhos, 24h, por um link. Agenda organizada, sem furos e sem WhatsApp lotado. Planos a partir de R$ 19,90/mês.",
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

/** Moldura de celular com um screenshot real do app. */
function PhoneShot({
  src,
  alt,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-[230px] sm:w-[250px] ${className}`}>
      <div className="rounded-[2.4rem] border-[9px] border-slate-900 bg-slate-900 shadow-2xl">
        <Image
          src={src}
          alt={alt}
          width={1050}
          height={2532}
          priority={priority}
          className="block h-auto w-full rounded-[1.7rem]"
          sizes="250px"
        />
      </div>
    </div>
  );
}

function PrimaryCta({ children = "Criar minha conta" }: { children?: string }) {
  return (
    <Link href={CTA_HREF}>
      <Button size="lg" fullWidth className="sm:w-auto">
        {children}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Button>
    </Link>
  );
}

/** Linha de funcionalidade: screenshot real + texto, alternando o lado. */
function FeatureRow({
  src,
  alt,
  eyebrow,
  title,
  description,
  points,
  reverse = false,
}: {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  reverse?: boolean;
}) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
      <div className={reverse ? "lg:order-2" : ""}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h3 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h3>
        <p className="mt-3 text-muted">{description}</p>
        <ul className="mt-5 space-y-2.5">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-sm text-foreground">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Check className="h-3.5 w-3.5" />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className={reverse ? "lg:order-1" : ""}>
        <PhoneShot src={src} alt={alt} />
      </div>
    </div>
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
              <Button size="sm">Criar conta</Button>
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
              online, 24 horas por dia. Planos a partir de R$ 19,90/mês — cancele quando quiser.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 lg:items-start">
              <PrimaryCta>Quero minha agenda cheia</PrimaryCta>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted lg:justify-start">
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-brand" /> Sem fidelidade
                </span>
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-brand" /> Cartão ou Pix
                </span>
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-brand" /> Pronto em 5 min
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[330px] overflow-hidden rounded-3xl shadow-2xl">
              <WistiaVsl mediaId="l1fxyqud2x" />
            </div>
          </div>
        </div>
      </section>

      {/* NÚMEROS */}
      <section className="border-y border-border bg-slate-950">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4">
          {[
            { n: "24h", l: "Agenda aberta" },
            { n: "0", l: "Horário duplicado" },
            { n: "5 min", l: "Para começar" },
            { n: "R$ 19,90", l: "A partir de/mês" },
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

      {/* FUNCIONALIDADES (screenshots reais do app) */}
      <section className="bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Por dentro do app</Eyebrow>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Veja como é simples na prática
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Telas reais do aplicativo. Feito pra funcionar no celular, mesmo pra
            quem não é de tecnologia.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-5xl space-y-16 sm:space-y-24">
          <FeatureRow
            src="/app/agendar.png"
            alt="Página pública de agendamento da Carvi"
            eyebrow="Para seus clientes"
            title="Seus clientes agendam sozinhos"
            description="Você compartilha um link com a sua marca. O cliente escolhe o serviço, vê só os horários livres e confirma — 24 horas por dia, sem instalar nada e sem criar conta."
            points={[
              "Link próprio com a logo do seu negócio",
              "Mostra apenas os horários realmente disponíveis",
              "Confirmação na hora, direto pelo celular",
            ]}
          />
          <FeatureRow
            src="/app/agenda.png"
            alt="Tela da agenda do dono no app da Carvi"
            eyebrow="Sua rotina"
            title="Toda a sua agenda organizada"
            description="Veja os atendimentos do dia, de amanhã e da semana numa tela só. Cada carro com horário, serviço, valor e status — e o sistema bloqueia dois agendamentos no mesmo horário sozinho."
            points={[
              "Hoje, amanhã e semana num toque",
              "Status de cada atendimento (agendado, em atendimento, finalizado)",
              "Fale com o cliente no WhatsApp em um clique",
            ]}
            reverse
          />
          <FeatureRow
            src="/app/financeiro.png"
            alt="Tela do financeiro com gráfico no app da Carvi"
            eyebrow="Seu dinheiro"
            title="Saiba exatamente quanto você lucra"
            description="Faturamento, despesas e lucro na palma da mão, com gráfico de faturamento por serviço. Descubra quais serviços dão mais retorno e exporte tudo em planilha."
            points={[
              "Faturamento, despesas e lucro por período",
              "Gráfico de faturamento por serviço",
              "Exportação em planilha (Excel)",
            ]}
          />
        </div>

        <div className="mt-14 text-center">
          <PrimaryCta>Criar minha conta</PrimaryCta>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Como começar</Eyebrow>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Pronto em 3 passos
          </h2>
        </div>
        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
          {[
            {
              icon: Sparkles,
              t: "1. Crie sua conta",
              d: "Cadastre serviços e horários em minutos.",
            },
            {
              icon: Link2,
              t: "2. Compartilhe o link",
              d: "No status, na bio ou no grupo.",
            },
            {
              icon: CalendarClock,
              t: "3. Receba agendamentos",
              d: "Sua agenda enche sozinha, sem furo.",
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

      {/* ANTES × DEPOIS */}
      <section className="bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>A virada de chave</Eyebrow>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            O antes e o depois da Carvi
          </h2>
        </div>
        <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
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
          <div className="rounded-3xl border border-brand/30 bg-brand-soft p-6">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
              <Check className="h-4 w-4" /> Com a Carvi
            </p>
            <ul className="mt-4 space-y-3 text-sm text-foreground">
              {[
                "Cliente agenda sozinho pelo seu link",
                "Agenda organizada e sincronizada",
                "Atende 24h, até com a loja fechada",
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
              icon: Sparkles,
              t: "Sua marca na frente",
              d: "Página de agendamento com a sua logo.",
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

          <div className="mx-auto mt-10 grid max-w-4xl items-stretch gap-5 sm:grid-cols-3">
            {(["basic", "premium", "empresarial"] as const).map((key) => {
              const plan = PLANS[key];
              const highlight = key === "premium";
              return highlight ? (
                <div
                  key={key}
                  className="relative flex flex-col rounded-3xl bg-gradient-to-br from-cyan-400 to-brand p-[2px] shadow-lg"
                >
                  <div className="flex flex-1 flex-col rounded-[calc(1.5rem-2px)] bg-card p-6 text-left">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">
                        {plan.name}
                      </p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-0.5 text-xs font-medium text-brand-foreground">
                        <Star className="h-3 w-3" /> Popular
                      </span>
                    </div>
                    <p className="mt-2 text-4xl font-extrabold text-foreground">
                      {formatCents(plan.priceCents)}
                      <span className="text-sm font-normal text-muted">/mês</span>
                    </p>
                    <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                      {plan.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-2 text-foreground"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <Link href={CTA_HREF} className="mt-6">
                      <Button fullWidth>Assinar {plan.name}</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div
                  key={key}
                  className="flex flex-col rounded-3xl border border-border bg-card p-6 text-left shadow-sm"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {plan.name}
                  </p>
                  <p className="mt-2 text-4xl font-extrabold text-foreground">
                    {formatCents(plan.priceCents)}
                    <span className="text-sm font-normal text-muted">/mês</span>
                  </p>
                  <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                    {plan.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-2 text-foreground"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link href={CTA_HREF} className="mt-6">
                    <Button variant="secondary" fullWidth>
                      Assinar {plan.name}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-xs text-muted">
            Pagamento por cartão ou Pix • Cancele quando quiser
          </p>
        </div>
      </section>

      {/* GARANTIA */}
      <section className="px-4 py-16">
        <div className="mx-auto flex max-w-2xl items-start gap-4 rounded-3xl border border-brand/30 bg-brand-soft p-6 sm:p-8">
          <ShieldCheck className="h-10 w-10 shrink-0 text-brand" aria-hidden />
          <div>
            <h2 className="text-lg font-bold text-foreground sm:text-xl">
              Sem fidelidade e sem complicação
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              Você assina por mês e cancela a renovação quando quiser. Pagamento
              seguro por cartão ou Pix, e o acesso é liberado na hora após a
              confirmação.
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
                q: "Preciso pagar para usar?",
                a: "Sim. Você cria a conta e escolhe um plano (a partir de R$ 19,90/mês). O acesso é liberado assim que o pagamento é confirmado.",
              },
              {
                q: "Quais as formas de pagamento?",
                a: "Cartão ou Pix, pela Cakto. A assinatura é mensal e você cancela a renovação quando quiser.",
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
                Criar minha conta
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
            <p className="text-xs text-slate-400">
              Cartão ou Pix • Pronto em 5 minutos • Cancele quando quiser
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
            Criar minha conta
          </Button>
        </Link>
      </div>

      {/* BOTÃO FLUTUANTE DO WHATSAPP */}
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
