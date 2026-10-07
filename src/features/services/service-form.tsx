"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import type { ActionState } from "@/lib/forms";

export interface ServiceFormValues {
  name: string;
  description: string;
  price: string; // ex.: "80,00"
  priceHatch: string;
  priceSedan: string;
  priceSuv: string;
  priceCaminhonete: string;
  duration_minutes: string; // ex.: "60"
  is_active: boolean;
}

const empty: ServiceFormValues = {
  name: "",
  description: "",
  price: "",
  priceHatch: "",
  priceSedan: "",
  priceSuv: "",
  priceCaminhonete: "",
  duration_minutes: "60",
  is_active: true,
};

export function ServiceForm({
  action,
  defaultValues = empty,
  submitLabel = "Salvar serviço",
  showVehiclePricing = true,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: ServiceFormValues;
  submitLabel?: string;
  showVehiclePricing?: boolean;
}) {
  const [state, formAction] = useActionState(action, {} as ActionState);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error && <Alert tone="error">{state.error}</Alert>}

      <FormField label="Nome do serviço" htmlFor="name" error={fe.name}>
        <Input
          id="name"
          name="name"
          defaultValue={defaultValues.name}
          placeholder="Ex.: Lavagem Completa"
          required
        />
      </FormField>

      <FormField
        label="Descrição (opcional)"
        htmlFor="description"
        error={fe.description}
      >
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaultValues.description}
          placeholder="Detalhes do serviço..."
        />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Preço (R$)" htmlFor="price_cents" error={fe.price_cents}>
          <Input
            id="price_cents"
            name="price_cents"
            inputMode="decimal"
            defaultValue={defaultValues.price}
            placeholder="80,00"
            required
          />
        </FormField>

        <FormField
          label="Duração (min)"
          htmlFor="duration_minutes"
          error={fe.duration_minutes}
        >
          <Input
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            min={1}
            step={5}
            inputMode="numeric"
            defaultValue={defaultValues.duration_minutes}
            placeholder="60"
            required
          />
        </FormField>
      </div>

      {/* Preço por porte de veículo (opcional) — Premium+ */}
      {showVehiclePricing && (
      <div className="rounded-xl border border-border bg-slate-50 p-3">
        <p className="text-sm font-medium text-foreground">
          Preço por porte de veículo{" "}
          <span className="font-normal text-muted">(opcional)</span>
        </p>
        <p className="mb-3 mt-0.5 text-xs text-muted">
          Preencha só se o preço mudar conforme o veículo. Em branco, usa o preço
          acima ({defaultValues.price ? `R$ ${defaultValues.price}` : "base"}).
        </p>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Hatch (R$)" htmlFor="price_hatch_cents" error={fe.price_hatch_cents}>
            <Input
              id="price_hatch_cents"
              name="price_hatch_cents"
              inputMode="decimal"
              defaultValue={defaultValues.priceHatch}
              placeholder="opcional"
            />
          </FormField>
          <FormField label="Sedan (R$)" htmlFor="price_sedan_cents" error={fe.price_sedan_cents}>
            <Input
              id="price_sedan_cents"
              name="price_sedan_cents"
              inputMode="decimal"
              defaultValue={defaultValues.priceSedan}
              placeholder="opcional"
            />
          </FormField>
          <FormField label="SUV (R$)" htmlFor="price_suv_cents" error={fe.price_suv_cents}>
            <Input
              id="price_suv_cents"
              name="price_suv_cents"
              inputMode="decimal"
              defaultValue={defaultValues.priceSuv}
              placeholder="opcional"
            />
          </FormField>
          <FormField label="Caminhonete (R$)" htmlFor="price_caminhonete_cents" error={fe.price_caminhonete_cents}>
            <Input
              id="price_caminhonete_cents"
              name="price_caminhonete_cents"
              inputMode="decimal"
              defaultValue={defaultValues.priceCaminhonete}
              placeholder="opcional"
            />
          </FormField>
        </div>
      </div>
      )}

      <label className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={defaultValues.is_active}
          className="h-5 w-5 rounded border-border text-brand accent-[var(--brand)]"
        />
        <span className="text-sm">
          <span className="font-medium text-foreground">Serviço ativo</span>
          <span className="block text-xs text-muted">
            Serviços inativos não aparecem em novos agendamentos.
          </span>
        </span>
      </label>

      <div className="flex gap-3 pt-2">
        <Link href="/servicos" className="flex-1">
          <Button type="button" variant="secondary" fullWidth>
            Cancelar
          </Button>
        </Link>
        <SubmitButton fullWidth className="flex-1" pendingText="Salvando...">
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}
