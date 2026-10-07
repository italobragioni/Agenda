"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock,
  Loader2,
  CheckCircle2,
  CalendarPlus,
  MessageCircle,
  Car,
  Truck,
} from "lucide-react";
import { createPublicBooking, type PublicBookingResult } from "./actions";
import {
  vehiclePriceCents,
  fromPriceCents,
  hasVehicleVariation,
} from "./vehicle";
import { formatCents } from "@/lib/money";
import { formatDateBR, formatTimeBR, WEEKDAY_LABELS } from "@/lib/datetime";
import { whatsappLink } from "@/lib/phone";
import { buildIcs, icsDataUrl } from "@/lib/ics";
import { trackMeta } from "@/components/analytics/meta-pixel";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  price_hatch_cents?: number | null;
  price_sedan_cents?: number | null;
  price_suv_cents?: number | null;
  price_caminhonete_cents?: number | null;
  duration_minutes: number;
}
interface Day {
  date: string;
  weekday: number;
  open: boolean;
}

type Step = "service" | "vehicle" | "date" | "time" | "details" | "success";

const VEHICLES: { label: string; icon: typeof Car }[] = [
  { label: "Hatch", icon: Car },
  { label: "Sedan", icon: Car },
  { label: "SUV", icon: Car },
  { label: "Caminhonete", icon: Truck },
];

export function PublicBooking({
  slug,
  businessName,
  businessLogoUrl,
  businessWhatsapp,
  services,
  days,
  tz,
}: {
  slug: string;
  businessName: string;
  businessLogoUrl?: string | null;
  businessWhatsapp: string | null;
  services: Service[];
  days: Day[];
  tz: string;
}) {
  const [step, setStep] = useState<Step>("service");
  const [service, setService] = useState<Service | null>(null);
  const [vehicle, setVehicle] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [slots, setSlots] = useState<string[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<PublicBookingResult["booking"]>();

  const [idempotencyKey] = useState<string>(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now()),
  );

  // Busca horários ao entrar no passo de horário.
  useEffect(() => {
    if (step !== "time" || !service || !date) return;
    let cancelled = false;
    setLoadingSlots(true);
    setSlots(null);
    fetch(
      `/api/public/disponibilidade?slug=${encodeURIComponent(slug)}&serviceId=${service.id}&date=${date}`,
    )
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setSlots(Array.isArray(d.slots) ? d.slots : []);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [step, service, date, slug]);

  const availableDays = days.filter((d) => d.open);

  function dayLabel(d: Day) {
    const [, m, day] = d.date.split("-");
    return `${WEEKDAY_LABELS[d.weekday].slice(0, 3)} ${day}/${m}`;
  }

  async function confirm() {
    if (!service) return;
    setSubmitting(true);
    setError(undefined);
    const res = await createPublicBooking({
      slug,
      serviceId: service.id,
      vehicle,
      date,
      time,
      customerName: name,
      customerPhone: phone,
      idempotencyKey,
    });
    setSubmitting(false);
    if (res.ok && res.booking) {
      setResult(res.booking);
      setStep("success");
      // Evento de conversão: cliente concluiu um agendamento.
      trackMeta("Schedule", {
        currency: "BRL",
        value: res.booking.priceCents / 100,
        content_name: res.booking.serviceName,
      });
    } else {
      setError(res.error ?? "Não foi possível concluir.");
      // Se o horário foi ocupado, volta para escolher outro.
      if (res.error?.includes("reservado")) setStep("time");
    }
  }

  // ---- Cabeçalho com voltar ----
  const canGoBack = step !== "service" && step !== "success";
  function goBack() {
    if (step === "vehicle") setStep("service");
    else if (step === "date") setStep("vehicle");
    else if (step === "time") setStep("date");
    else if (step === "details") setStep("time");
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      {/* Cabeçalho do estabelecimento */}
      {step !== "success" && (
        <div className="mb-6 text-center">
          {businessLogoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={businessLogoUrl}
              alt={businessName}
              className="mx-auto mb-3 h-20 w-auto object-contain"
            />
          )}
          <h1 className="text-xl font-semibold text-foreground">
            {businessName}
          </h1>
          <p className="mt-1 text-sm text-muted">Agende seu horário</p>
        </div>
      )}

      {canGoBack && (
        <button
          type="button"
          onClick={goBack}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
      )}

      <div key={step} className="step-enter">
      {/* PASSO 1 — SERVIÇO */}
      {step === "service" && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Escolha o serviço
          </h2>
          {services.length === 0 && (
            <p className="rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted">
              Nenhum serviço disponível no momento.
            </p>
          )}
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setService(s);
                setStep("vehicle");
              }}
              className="tap flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 text-left hover:border-brand"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{s.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                  <Clock className="h-3 w-3" /> {s.duration_minutes} min
                </p>
              </div>
              <span className="shrink-0 text-right">
                {hasVehicleVariation(s) && (
                  <span className="block text-[10px] font-normal text-muted">
                    a partir de
                  </span>
                )}
                <span className="font-semibold text-brand">
                  {formatCents(
                    hasVehicleVariation(s) ? fromPriceCents(s) : s.price_cents,
                  )}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* PASSO 2 — TIPO DE VEÍCULO */}
      {step === "vehicle" && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Qual o tipo do veículo?
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {VEHICLES.map((v) => (
              <button
                key={v.label}
                type="button"
                onClick={() => {
                  setVehicle(v.label);
                  setStep("date");
                }}
                className="tap flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-3 py-5 text-sm font-medium text-foreground hover:border-brand"
              >
                <v.icon className="h-7 w-7 text-brand" />
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PASSO 3 — DATA */}
      {step === "date" && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Escolha o dia
          </h2>
          {availableDays.length === 0 ? (
            <p className="text-sm text-muted">
              Nenhum dia disponível para agendamento.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availableDays.map((d) => (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => {
                    setDate(d.date);
                    setTime("");
                    setStep("time");
                  }}
                  className="tap rounded-xl border border-border bg-card px-2 py-3 text-sm font-medium text-foreground hover:border-brand"
                >
                  {dayLabel(d)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PASSO 3 — HORÁRIO */}
      {step === "time" && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Escolha o horário
          </h2>
          {loadingSlots ? (
            <p className="flex items-center gap-2 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> Buscando horários...
            </p>
          ) : slots && slots.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setTime(s);
                    setStep("details");
                  }}
                  className="tap h-11 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:border-brand"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">
              Nenhum horário disponível nesse dia. Tente outro.
            </p>
          )}
        </div>
      )}

      {/* PASSO 4 — DADOS */}
      {step === "details" && service && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Seus dados</h2>

          {/* Resumo */}
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="font-medium text-foreground">{service.name}</p>
            {vehicle && <p className="text-muted">Veículo: {vehicle}</p>}
            <p className="text-muted">
              {formatDateBR(`${date}T12:00:00Z`, "UTC")} às {time} ·{" "}
              {formatCents(vehiclePriceCents(service, vehicle))}
            </p>
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div>
            <label
              htmlFor="pb-name"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Nome
            </label>
            <input
              id="pb-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-card px-3 focus:border-brand focus:outline-2 focus:outline-brand"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label
              htmlFor="pb-phone"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              WhatsApp
            </label>
            <input
              id="pb-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-card px-3 focus:border-brand focus:outline-2 focus:outline-brand"
              placeholder="(31) 99999-9999"
            />
          </div>

          <button
            type="button"
            onClick={confirm}
            disabled={submitting}
            className="tap flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-base font-medium text-brand-foreground hover:bg-brand-hover disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Confirmando..." : "Confirmar agendamento"}
          </button>
        </div>
      )}

      {/* PASSO 5 — SUCESSO */}
      {step === "success" && result && (
        <div className="text-center">
          <div className="ring-pulse check-pop relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="relative h-9 w-9" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Agendamento confirmado! 🚗
          </h1>
          <div className="mx-auto mt-5 max-w-xs rounded-2xl border border-border bg-card p-5 text-left">
            <p className="font-medium text-foreground">{result.serviceName}</p>
            {vehicle && (
              <p className="mt-1 text-sm text-muted">Veículo: {vehicle}</p>
            )}
            <p className="mt-1 text-sm text-muted">
              {formatDateBR(result.startAtIso, tz)} às{" "}
              {formatTimeBR(result.startAtIso, tz)}
            </p>
            <p className="mt-1 text-sm text-muted">
              {result.durationMinutes} min · {formatCents(result.priceCents)}
            </p>
          </div>

          <div className="mx-auto mt-6 flex max-w-xs flex-col gap-3">
            <a
              href={icsDataUrl(
                buildIcs({
                  title: `${result.serviceName} - ${businessName}`,
                  startIso: result.startAtIso,
                  endIso: result.endAtIso,
                }),
              )}
              download="agendamento.ics"
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-slate-50"
            >
              <CalendarPlus className="h-4 w-4" /> Adicionar ao calendário
            </a>
            {businessWhatsapp && (
              <a
                href={whatsappLink(
                  businessWhatsapp,
                  `Olá! Acabei de agendar ${result.serviceName}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 text-sm font-medium text-white hover:bg-green-700"
              >
                <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
