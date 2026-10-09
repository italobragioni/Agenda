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
            <Link href={CTA_HREF}>
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
            <Eyebrow>Feito pra lava-jato brasileiro</Eyebrow>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
              Sua agenda{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-brand bg-clip-text text-transparent">
                enche sozinha
              </span>{" "}
              enquanto você tá com a mão no carro.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted sm:text-lg lg:mx-0">
              Chega de viver preso no WhatsApp respondendo cliente. Com a Carvi,
              o cliente agenda sozinho pelo seu link — 24 horas por dia, sem você
              parar de trabalhar.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 lg:items-start">
              <PrimaryCta>Quero minha agenda cheia</PrimaryCta>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted lg:justify-start">
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-brand" /> Sem fidelidade
                </span>
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-brand" /> Pronto em 5 minutos
                </span>
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-brand" /> Cartão ou Pix
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
            { n: "24h", l: "Agendando por você" },
            { n: "0", l: "Furo ou carro em dobro" },
            { n: "5 min", l: "Pra começar a usar" },
            { n: "R$ 19,90", l: "Menos que uma lavagem" },
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
            Olha quanto dinheiro tá escorrendo pelo ralo todo dia
          </h2>
        </div>
        <ul className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
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
          <Eyebrow>A solução</Eyebrow>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            E se o celular trabalhasse PRA você?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            A Carvi transforma seu celular de prisão em máquina de agendamento.
            Você cadastra serviços e horários, ganha um link com a sua marca, e o
            cliente agenda sozinho. Você só olha a agenda organizada e lava carro.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-5xl space-y-16 sm:space-y-24">
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

        <div className="mt-14 text-center">
          <PrimaryCta>Criar minha conta</PrimaryCta>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Como começar</Eyebrow>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Do caderno pra agenda cheia em 3 passos
          </h2>
        </div>
        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
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
            A diferença entre amador e dono de negócio
          </h2>
        </div>
        <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-red-600">
              <X className="h-4 w-4" /> Sem a Carvi
            </p>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              {[
                "Celular lotado de “tem horário amanhã?” o dia inteiro",
                "Carro marcado em dobro e cliente irritado na porta",
                "Fim do mês sem saber se lucrou ou só rodou",
                "Box parado porque você esqueceu de anotar",
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
                "Cliente agenda sozinho, você trabalha em paz",
                "Horário ocupado some da tela — nunca mais dois no mesmo",
                "Faturamento e lucro na tela, sempre que quiser",
                "Agenda cheia e organizada, box sempre girando",
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
            O que muda na sua vida a partir de hoje
          </h2>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
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
            Escolha seu plano e comece a lucrar hoje
          </h2>
          <p className="mt-3 text-muted">
            Custa menos que uma lavagem simples por mês. Um único cliente que
            você deixaria de perder já paga o plano inteiro.
          </p>

          <div className="mx-auto mt-10 grid max-w-4xl items-stretch gap-5 sm:grid-cols-3">
            {(["basic", "premium", "empresarial"] as const).map((key) => {
              const plan = PLANS[key];
              const highlight = key === "empresarial";
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
                        <Star className="h-3 w-3" /> Recomendado
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted">
                      {PLAN_TAGLINES[key]}
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
                  <p className="mt-1.5 text-xs text-muted">
                    {PLAN_TAGLINES[key]}
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
            Cartão ou Pix • Sem fidelidade • Acesso na hora
          </p>
        </div>
      </section>

      {/* GARANTIA */}
      <section className="px-4 py-16">
        <div className="mx-auto flex max-w-2xl items-start gap-4 rounded-3xl border border-brand/30 bg-brand-soft p-6 sm:p-8">
          <ShieldCheck className="h-10 w-10 shrink-0 text-brand" aria-hidden />
          <div>
            <h2 className="text-lg font-bold text-foreground sm:text-xl">
              Sem pegadinha, sem contrato, sem risco
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              Aqui ninguém te prende. Sem fidelidade, sem multa, sem letra miúda.
              Você assina, o acesso libera na hora e já sai usando em 5 minutos.
              Quiser parar, cancela quando bem entender. O único risco de verdade
              é continuar perdendo cliente mais um mês no caderno.
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
            Cada dia no caderno é mais um cliente que você perde
          </h2>
          <p className="mt-3 text-slate-300">
            Enquanto você pensa, o concorrente já tá com a agenda enchendo
            sozinha. Vira a chave agora — leva 5 minutos e o acesso libera na hora.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link href={CTA_HREF}>
              <Button size="lg">
                Criar minha conta agora
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
            <p className="text-xs text-slate-400">
              Cartão ou Pix • Pronto em 5 minutos • Cancele quando quiser
            </p>
            <p className="mx-auto mt-2 max-w-md text-xs text-slate-400">
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
