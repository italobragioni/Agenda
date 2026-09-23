"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createAppointmentByOwner } from "./actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { formatPhone } from "@/lib/phone";
import type { ActionState } from "@/lib/forms";

interface ServiceOption {
  id: string;
  name: string;
  price_cents: number;
  duration_minutes: number;
}

interface CustomerSuggestion {
  id: string;
  name: string;
  phone: string;
}

function centsToInput(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function NewAppointmentForm({
  services,
  today,
}: {
  services: ServiceOption[];
  today: string;
}) {
  const [state, formAction] = useActionState(
    createAppointmentByOwner,
    {} as ActionState,
  );
  const fe = state.fieldErrors ?? {};

  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(today);
  const [price, setPrice] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<string[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [suggestions, setSuggestions] = useState<CustomerSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [idempotencyKey] = useState<string>(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now()),
  );

  // Preenche o preço automaticamente ao escolher o serviço.
  function handleServiceChange(id: string) {
    setServiceId(id);
    setTime("");
    const svc = services.find((s) => s.id === id);
    if (svc) setPrice(centsToInput(svc.price_cents));
  }

  // Busca horários disponíveis quando serviço + data estão definidos.
  useEffect(() => {
    if (!serviceId || !date) {
      setSlots(null);
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    setSlots(null);
    fetch(
      `/api/disponibilidade?serviceId=${encodeURIComponent(serviceId)}&date=${date}`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSlots(Array.isArray(data.slots) ? data.slots : []);
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
  }, [serviceId, date]);

  // Autocompletar cliente pelo nome digitado.
  useEffect(() => {
    const term = customerName.trim();
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("customers")
        .select("id, name, phone")
        .ilike("name", `%${term}%`)
        .limit(5);
      if (!cancelled) setSuggestions((data ?? []) as CustomerSuggestion[]);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [customerName]);

  function pickCustomer(c: CustomerSuggestion) {
    setCustomerName(c.name);
    setCustomerPhone(formatPhone(c.phone));
    setShowSuggestions(false);
  }

  if (services.length === 0) {
    return (
      <Alert tone="info">
        Você precisa cadastrar ao menos um serviço ativo antes de criar
        agendamentos.{" "}
        <Link href="/servicos/novo" className="font-medium underline">
          Cadastrar serviço
        </Link>
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error && <Alert tone="error">{state.error}</Alert>}

      {/* Campos ocultos com os valores controlados */}
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="time" value={time} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />

      <FormField label="Serviço" htmlFor="service" error={fe.serviceId}>
        <select
          id="service"
          value={serviceId}
          onChange={(e) => handleServiceChange(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-card px-3 text-foreground focus:border-brand focus:outline-2 focus:outline-brand"
          required
        >
          <option value="">Selecione um serviço</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.duration_minutes} min
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Data" htmlFor="date" error={fe.date}>
        <Input
          id="date"
          name="date"
          type="date"
          value={date}
          min={today}
          onChange={(e) => {
            setDate(e.target.value);
            setTime("");
          }}
          required
        />
      </FormField>

      <FormField label="Horário" htmlFor="time-group" error={fe.time}>
        {!serviceId ? (
          <p className="text-sm text-muted">Selecione um serviço primeiro.</p>
        ) : loadingSlots ? (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Buscando horários...
          </p>
        ) : slots && slots.length > 0 ? (
          <div id="time-group" className="grid grid-cols-4 gap-2">
            {slots.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setTime(s)}
                className={cn(
                  "h-10 rounded-lg border text-sm font-medium transition-colors",
                  time === s
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border bg-card text-foreground hover:border-brand",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">
            Nenhum horário disponível nesse dia.
          </p>
        )}
      </FormField>

      <div className="relative">
        <FormField label="Cliente" htmlFor="customerName" error={fe.customerName}>
          <Input
            id="customerName"
            name="customerName"
            value={customerName}
            onChange={(e) => {
              setCustomerName(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            autoComplete="off"
            placeholder="Nome do cliente"
            required
          />
        </FormField>
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            {suggestions.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => pickCustomer(c)}
                  className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-slate-50"
                >
                  <span className="text-sm font-medium text-foreground">
                    {c.name}
                  </span>
                  <span className="text-xs text-muted">
                    {formatPhone(c.phone)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <FormField
        label="Telefone / WhatsApp"
        htmlFor="customerPhone"
        error={fe.customerPhone}
      >
        <Input
          id="customerPhone"
          name="customerPhone"
          type="tel"
          inputMode="tel"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="(31) 99999-9999"
          required
        />
      </FormField>

      <FormField
        label="Valor (R$)"
        htmlFor="price"
        error={fe.price}
        hint="Preenchido pelo serviço; você pode ajustar."
      >
        <Input
          id="price"
          name="price"
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0,00"
        />
      </FormField>

      <FormField label="Observação (opcional)" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={2} />
      </FormField>

      <div className="flex gap-3 pt-2">
        <Link href="/agenda" className="flex-1">
          <Button type="button" variant="secondary" fullWidth>
            Cancelar
          </Button>
        </Link>
        <SubmitButton fullWidth className="flex-1" pendingText="Salvando...">
          Salvar agendamento
        </SubmitButton>
      </div>
    </form>
  );
}
