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
    "Sua agenda enche sozinha enquanto você trabalha. O cliente agenda pelo seu link, 24h, sem WhatsApp lotado e sem furo. Planos a partir de R$ 19,90/mês.",
};

const CTA_HREF = "/cadastro";
const YEAR = new Date().getFullYear();

/** Frase de reforço (copy) exibida sob o nome de cada plano. */
const PLAN_TAGLINES: Record<"basic" | "premium" | "empresarial", string> = {
  basic: "Pra quem tá começando a organizar a casa.",
  premium: "Pro lava-jato que tá crescendo de verdade.",
  empresarial: "O plano de quem joga pra ganhar e quer escalar.",
};

function Eyebrow({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-brand-soft px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand">
      <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
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
    <div className={`relative mx-auto w-[230px] sm:w-[260px] ${className}`}>
      <div
        className="pointer-events-none absolute -inset-5 -z-10 rounded-[3rem] bg-gradient-to-br from-cyan-400/20 to-brand/20 blur-2xl"
        aria-hidden
      />
      <div className="relative rounded-[2.6rem] border-[10px] border-slate-900 bg-slate-900 shadow-soft ring-1 ring-black/5">
        <span
          className="absolute left-1/2 top-[7px] z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-slate-700"
          aria-hidden
        />
        <Image
          src={src}
          alt={alt}
          width={1050}
          height={2532}
          priority={priority}
          className="block h-auto w-full rounded-[1.9rem]"
          sizes="(max-width: 640px) 230px, 260px"
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
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={reverse ? "lg:order-2" : ""}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h3 className="mt-5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h3>
        <p className="mt-3 text-base leading-relaxed text-muted">
          {description}
        </p>
        <ul className="mt-6 space-y-3">
          {points.map((p) => (
            <li
              key={p}
              className="flex items-start gap-3 text-sm text-foreground"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Check className="h-3.5 w-3.5" aria-hidden />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className={reverse ? "lg:order-1" : ""}>
        <div className="relative rounded-[2.25rem] bg-gradient-to-br from-brand-soft via-white to-slate-50 p-8 ring-1 ring-inset ring-brand/10 sm:p-12">
          <PhoneShot src={src} alt={alt} />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-white pb-20 sm:pb-0">
      {/* Barra superior */}
      <header className="sticky top-0 z-30 border-b border-border bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <CarviLogo className="h-8" transparent />
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="tap rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-slate-100"
            >
              Entrar
            </Link>
            <Link href={CTA_HREF}>
              <Button size="sm">Criar conta</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-white">
        <div
          className="pointer-events-none absolute inset-0 bg-dotgrid opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-32 right-[-8%] h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-cyan-300/40 to-brand/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-40 left-[-10%] h-80 w-80 rounded-full bg-gradient-to-tr from-brand/15 to-cyan-200/25 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-6 lg:items-center">
            {/* Texto principal */}
            <div className="order-1 flex flex-col items-center text-center lg:col-start-1 lg:row-start-1 lg:items-start lg:text-left">
              <Eyebrow>Feito pra lava-jato brasileiro</Eyebrow>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
                Sua agenda{" "}
                <span className="text-gradient-brand">enche sozinha</span>{" "}
                enquanto você tá com a mão no carro.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                Chega de viver preso no WhatsApp respondendo cliente. Com a
                Carvi, o cliente agenda sozinho pelo seu link — 24 horas por
                dia, sem você parar de trabalhar.
              </p>
            </div>

            {/* Vídeo VSL — peça de destaque do hero */}
            <div className="order-2 w-full lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:justify-self-end lg:self-center">
              <div className="relative mx-auto w-full max-w-[300px]">
                <div
                  className="pointer-events-none absolute -inset-5 -z-10 rounded-[2.5rem] bg-gradient-to-br from-cyan-400/30 to-brand/30 blur-2xl"
                  aria-hidden
                />
                <div className="overflow-hidden rounded-[1.9rem] bg-slate-900 p-1.5 shadow-soft-brand ring-1 ring-black/5">
                  <div className="overflow-hidden rounded-[1.5rem]">
                    <WistiaVsl mediaId="l1fxyqud2x" />
                  </div>
                </div>
              </div>
            </div>

            {/* CTA + selos de confiança */}
            <div className="order-3 flex flex-col items-center gap-4 lg:col-start-1 lg:row-start-2 lg:items-start">
              <PrimaryCta>Quero minha agenda cheia</PrimaryCta>
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-muted lg:justify-start">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-brand" aria-hidden /> Sem
                  fidelidade
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-brand" aria-hidden /> Pronto em
                  5 minutos
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-brand" aria-hidden /> Cartão ou
                  Pix
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NÚMEROS */}
      <section className="relative overflow-hidden bg-slate-950">
        <div
          className="pointer-events-none absolute inset-0 bg-dotgrid-dark opacity-70"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-4xl grid-cols-2 px-4 py-10 sm:grid-cols-4">
          {[
            { n: "24h", l: "Agendando por você" },
            { n: "0", l: "Furo ou carro em dobro" },
            { n: "5 min", l: "Pra começar a usar" },
            { n: "R$ 19,90", l: "Menos que uma lavagem" },
          ].map((s) => (
            <div
              key={s.l}
              className="px-3 py-3 text-center sm:border-l sm:border-white/10 sm:first:border-l-0"
            >
              <p className="text-3xl font-extrabold sm:text-4xl">
                <span className="text-gradient-brand">{s.n}</span>
              </p>
              <p className="mt-1.5 text-xs font-medium text-slate-400">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DOR */}
      <section className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>O problema</Eyebrow>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Olha quanto dinheiro tá escorrendo pelo ralo todo dia
          </h2>
        </div>
        <ul className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
          {[
            "Você demora 20 minutos pra responder e o cliente já marcou no concorrente.",
            "Marcou dois carros no mesmo horário e passou vergonha na frente do cliente.",
            "Anotou no caderno, rasurou, esqueceu — e o box ficou parado.",
            "Passa o dia inteiro com o celular na mão em vez de lavar carro e faturar.",
            "Chega o fim do mês e você não faz ideia de quanto entrou nem quanto sobrou.",
            "Furou um horário, o box ficou vazio, e aquele dinheiro não volta nunca mais.",
          ].map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-md"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <X className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="text-sm leading-relaxed text-foreground">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* FUNCIONALIDADES (screenshots reais do app) */}
      <section className="border-y border-border bg-slate-50 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>A solução</Eyebrow>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            E se o celular trabalhasse PRA você?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
            A Carvi transforma seu celular de prisão em máquina de agendamento.
            Você cadastra serviços e horários, ganha um link com a sua marca, e o
            cliente agenda sozinho. Você só olha a agenda organizada e lava carro.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl space-y-20 sm:space-y-28">
          <FeatureRow
            src="/app/agendar.png"
            alt="Página pública de agendamento da Carvi"
            eyebrow="Seu link, sua marca"
            title="O cliente agenda sozinho, você nem precisa responder"
            description="Um link profissional com a cara do seu negócio, aberto 24h. O cliente escolhe o serviço, vê só o que tá livre e confirma — sem te incomodar."
            points={[
              "Funciona de dia e de noite, até quando você tá dormindo",
              "Cliente não precisa baixar app nem criar conta",
              "Só aparecem os horários que você tem livre (zero confusão)",
            ]}
          />
          <FeatureRow
            src="/app/agenda.png"
            alt="Tela da agenda do dono no app da Carvi"
            eyebrow="Tudo num lugar só"
            title="Pare de adivinhar quem vem e quando"
            description="Toda a sua agenda limpa e organizada na tela, com o status de cada carro e atalho direto pro WhatsApp do cliente."
            points={[
              "Veja o dia inteiro de bate-pronto, sem caderno rasurado",
              "Controle seus boxes: quantos carros atende ao mesmo tempo",
              "Fale com o cliente num toque pelo atalho de WhatsApp",
            ]}
            reverse
          />
          <FeatureRow
            src="/app/financeiro.png"
            alt="Tela do financeiro com gráfico no app da Carvi"
            eyebrow="O jogo da virada"
            title="Saiba exatamente quanto faturou e quanto sobrou"
            description="Faturamento, despesas e lucro na palma da mão. Descubra qual serviço te dá mais dinheiro e pare de trabalhar no escuro."
            points={[
              "Faturamento, despesas e lucro sem conta de cabeça",
              "Gráfico que mostra qual serviço enche mais seu bolso",
              "Exporte tudo em planilha quando precisar",
            ]}
          />
        </div>

        <div className="mt-16 text-center">
          <PrimaryCta>Criar minha conta</PrimaryCta>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Como começar</Eyebrow>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Do caderno pra agenda cheia em 3 passos
          </h2>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-3">
          {[
            {
              icon: Sparkles,
              t: "1. Crie sua conta",
              d: "Leva 5 minutos. Cartão ou Pix e o acesso libera na hora.",
            },
            {
              icon: CalendarClock,
              t: "2. Cadastre serviços e horários",
              d: "Diga o que você faz, por quanto e quando atende. Pronto.",
            },
            {
              icon: Link2,
              t: "3. Divulgue seu link",
              d: "Mande no WhatsApp, cole na bio, bote no adesivo.",
            },
          ].map((s, i) => (
            <div
              key={s.t}
              className="relative rounded-3xl border border-border bg-card p-7 text-center shadow-soft transition-shadow hover:shadow-md"
            >
              <span className="absolute right-5 top-5 text-5xl font-black leading-none text-slate-100 select-none">
                {i + 1}
              </span>
              <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-brand text-brand-foreground shadow-soft-brand">
                <s.icon className="h-6 w-6" aria-hidden />
              </span>
              <p className="relative mt-5 text-base font-semibold text-foreground">
                {s.t}
              </p>
              <p className="relative mt-1.5 text-sm leading-relaxed text-muted">
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ANTES × DEPOIS */}
      <section className="border-y border-border bg-slate-50 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>A virada de chave</Eyebrow>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            A diferença entre amador e dono de negócio
          </h2>
        </div>
        <div className="mx-auto mt-12 grid max-w-3xl gap-5 sm:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-7 shadow-soft">
            <p className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-600">
              <X className="h-4 w-4" aria-hidden /> Sem a Carvi
            </p>
            <ul className="mt-5 space-y-3.5 text-sm text-muted">
              {[
                "Celular lotado de “tem horário amanhã?” o dia inteiro",
                "Carro marcado em dobro e cliente irritado na porta",
                "Fim do mês sem saber se lucrou ou só rodou",
                "Box parado porque você esqueceu de anotar",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <X
                    className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
                    aria-hidden
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-brand/30 bg-brand-soft p-7 shadow-soft">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-brand">
              <Check className="h-4 w-4" aria-hidden /> Com a Carvi
            </p>
            <ul className="mt-5 space-y-3.5 text-sm text-foreground">
              {[
                "Cliente agenda sozinho, você trabalha em paz",
                "Horário ocupado some da tela — nunca mais dois no mesmo",
                "Faturamento e lucro na tela, sempre que quiser",
                "Agenda cheia e organizada, box sempre girando",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-brand"
                    aria-hidden
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Benefícios</Eyebrow>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            O que muda na sua vida a partir de hoje
          </h2>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: MessageSquareOff,
              t: "Mais tempo na mão",
              d: "Largue o celular e volte a lavar carro.",
            },
            {
              icon: ShieldCheck,
              t: "Fim da vergonha",
              d: "Nunca mais marque dois carros no mesmo horário.",
            },
            {
              icon: Sparkles,
              t: "Cara de profissional",
              d: "Um link com a sua marca que impressiona o cliente.",
            },
            {
              icon: CalendarClock,
              t: "Cliente que não some",
              d: "Ele agenda na hora, sem esperar você responder.",
            },
            {
              icon: CarFront,
              t: "Box sempre girando",
              d: "Horário livre vira carro marcado, até de madrugada.",
            },
            {
              icon: TrendingUp,
              t: "Dinheiro no controle",
              d: "Saiba quanto entra, quanto sai e quanto sobra.",
            },
            {
              icon: Users,
              t: "Equipe na mesma conta",
              d: "Coloque seus funcionários pra trabalhar junto.",
            },
            {
              icon: Smartphone,
              t: "Paz de cabeça",
              d: "Sua agenda trabalha sozinha enquanto você vive.",
            },
          ].map((b) => (
            <div
              key={b.t}
              className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                <b.icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-4 text-sm font-semibold text-foreground">
                {b.t}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PREÇOS */}
      <section className="border-y border-border bg-slate-50 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Planos</Eyebrow>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Escolha seu plano e comece a lucrar hoje
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
            Custa menos que uma lavagem simples por mês. Um único cliente que
            você deixaria de perder já paga o plano inteiro.
          </p>

          <div className="mx-auto mt-12 grid max-w-4xl items-stretch gap-6 sm:grid-cols-3">
            {(["basic", "premium", "empresarial"] as const).map((key) => {
              const plan = PLANS[key];
              const highlight = key === "empresarial";
              return highlight ? (
                <div
                  key={key}
                  className="relative z-10 flex flex-col rounded-3xl bg-gradient-to-br from-cyan-400 to-brand p-[2px] shadow-soft-brand lg:scale-[1.04]"
                >
                  <div className="flex flex-1 flex-col rounded-[calc(1.5rem-2px)] bg-card p-6 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {plan.name}
                      </p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-0.5 text-xs font-medium text-brand-foreground">
                        <Star className="h-3 w-3" aria-hidden /> Recomendado
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted">
                      {PLAN_TAGLINES[key]}
                    </p>
                    <p className="mt-3 text-4xl font-extrabold text-foreground">
                      {formatCents(plan.priceCents)}
                      <span className="text-sm font-normal text-muted">
                        /mês
                      </span>
                    </p>
                    <ul className="mt-6 flex-1 space-y-3 text-sm">
                      {plan.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-2 text-foreground"
                        >
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-brand"
                            aria-hidden
                          />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <Link href={CTA_HREF} className="mt-7">
                      <Button fullWidth>Assinar {plan.name}</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div
                  key={key}
                  className="flex flex-col rounded-3xl border border-border bg-card p-6 text-left shadow-soft transition-shadow hover:shadow-md"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {plan.name}
                  </p>
                  <p className="mt-1.5 text-xs text-muted">
                    {PLAN_TAGLINES[key]}
                  </p>
                  <p className="mt-3 text-4xl font-extrabold text-foreground">
                    {formatCents(plan.priceCents)}
                    <span className="text-sm font-normal text-muted">/mês</span>
                  </p>
                  <ul className="mt-6 flex-1 space-y-3 text-sm">
                    {plan.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-2 text-foreground"
                      >
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-brand"
                          aria-hidden
                        />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link href={CTA_HREF} className="mt-7">
                    <Button variant="secondary" fullWidth>
                      Assinar {plan.name}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
          <p className="mt-8 text-xs text-muted">
            Cartão ou Pix • Sem fidelidade • Acesso na hora
          </p>
        </div>
      </section>

      {/* GARANTIA */}
      <section className="px-4 py-20 sm:py-28">
        <div className="mx-auto flex max-w-2xl items-start gap-5 rounded-3xl border border-brand/30 bg-brand-soft p-7 shadow-soft sm:p-9">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-brand shadow-soft">
            <ShieldCheck className="h-7 w-7" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-bold text-foreground sm:text-xl">
              Sem pegadinha, sem contrato, sem risco
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Aqui ninguém te prende. Sem fidelidade, sem multa, sem letra miúda.
              Você assina, o acesso libera na hora e já sai usando em 5 minutos.
              Quiser parar, cancela quando bem entender. O único risco de verdade
              é continuar perdendo cliente mais um mês no caderno.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-y border-border bg-slate-50 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <Eyebrow>Dúvidas</Eyebrow>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Perguntas frequentes
            </h2>
          </div>
          <div className="mt-10 space-y-3">
            {[
              {
                q: "Preciso saber de tecnologia pra usar?",
                a: "Não. Se você manda mensagem no WhatsApp, você usa a Carvi. Foi feita pra dono de lava-jato, não pra programador.",
              },
              {
                q: "E se eu quiser cancelar?",
                a: "Cancela quando quiser, na hora. Sem fidelidade, sem multa, sem enrolação.",
              },
              {
                q: "O cliente precisa baixar algum app?",
                a: "Nada. Ele só abre o seu link, escolhe o horário e confirma. Não baixa nada e não cria conta.",
              },
              {
                q: "Funciona no meu celular?",
                a: "Funciona. A Carvi foi feita pra celular. Você gerencia tudo da palma da mão, onde estiver.",
              },
              {
                q: "Quanto tempo pra começar a usar?",
                a: "Mais ou menos 5 minutos. Cria a conta, cadastra seus serviços e horários, e seu link já tá no ar.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors open:border-brand/30"
              >
                <summary className="tap flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-foreground">
                  {item.q}
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-lg leading-none text-brand transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative overflow-hidden bg-slate-950 px-4 py-24 text-center">
        <div
          className="pointer-events-none absolute inset-0 bg-dotgrid-dark opacity-60"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-cyan-400/30 to-brand/30 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Cada dia no caderno é mais um cliente que você perde
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-300">
            Enquanto você pensa, o concorrente já tá com a agenda enchendo
            sozinha. Vira a chave agora — leva 5 minutos e o acesso libera na hora.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3">
            <Link href={CTA_HREF}>
              <Button size="lg">
                Criar minha conta agora
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
            <p className="text-xs text-slate-400">
              Cartão ou Pix • Pronto em 5 minutos • Cancele quando quiser
            </p>
            <p className="mx-auto mt-3 max-w-md rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs leading-relaxed text-slate-300">
              PS: quanto você já perdeu esse mês de horário furado e cliente que
              sumiu? A Carvi custa menos que uma lavagem simples. Deixar pra
              depois é escolher perder de novo.
            </p>
            <a
              href={SUPPORT_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-green-400 hover:text-green-300"
            >
              <MessageCircle className="h-4 w-4" aria-hidden /> Tem dúvidas? Fale
              no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="border-t border-border bg-white px-4 py-10">
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

      {/* BOTÃO FLUTUANTE DO WHATSAPP */}
      <a
        href={SUPPORT_WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Dúvidas? Fale no WhatsApp"
        className="tap fixed bottom-6 right-4 z-40 flex flex-col items-center gap-1.5 sm:right-6"
      >
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-foreground shadow-md ring-1 ring-black/5">
          Dúvidas?
        </span>
        <span className="wa-pulse flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700">
          <MessageCircle className="h-7 w-7" aria-hidden />
        </span>
      </a>
    </div>
  );
}
