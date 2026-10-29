"use client";

import { useActionState } from "react";
import { saveChecklist } from "./checklist-actions";
import {
  CHECKLIST_ITENS,
  CHECKLIST_AVARIAS,
  CHECKLIST_COMBUSTIVEL,
  type Checklist,
} from "./checklist";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { formatDateTimeBR } from "@/lib/datetime";
import type { ActionState } from "@/lib/forms";

export function ChecklistForm({
  appointmentId,
  checklist,
  tz,
}: {
  appointmentId: string;
  checklist: Checklist | null;
  tz: string;
}) {
  const action = saveChecklist.bind(null, appointmentId);
  const [state, formAction] = useActionState(action, {} as ActionState);

  const itensSet = new Set(checklist?.itens ?? []);
  const avariasSet = new Set(checklist?.avarias ?? []);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      {/* Combustível */}
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
          Nível de combustível
        </p>
        <div className="flex flex-wrap gap-2">
          {CHECKLIST_COMBUSTIVEL.map((nivel) => (
            <label
              key={nivel}
              className="tap cursor-pointer rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground has-[:checked]:border-brand has-[:checked]:bg-brand has-[:checked]:text-brand-foreground"
            >
              <input
                type="radio"
                name="combustivel"
                value={nivel}
                defaultChecked={checklist?.combustivel === nivel}
                className="sr-only"
              />
              {nivel}
            </label>
          ))}
        </div>
      </div>

      {/* Quilometragem */}
      <FormField label="Quilometragem (opcional)" htmlFor="km">
        <Input
          id="km"
          name="km"
          inputMode="numeric"
          defaultValue={checklist?.km ?? ""}
          placeholder="Ex.: 85.000 km"
        />
      </FormField>

      {/* Itens no veículo */}
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
          Itens no veículo
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CHECKLIST_ITENS.map((item) => (
            <label
              key={item}
              className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground"
            >
              <input
                type="checkbox"
                name="itens"
                value={item}
                defaultChecked={itensSet.has(item)}
                className="h-5 w-5 rounded border-border accent-[var(--brand)]"
              />
              {item}
            </label>
          ))}
        </div>
      </div>

      {/* Avarias / estado */}
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
          Avarias / estado na chegada
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CHECKLIST_AVARIAS.map((item) => (
            <label
              key={item}
              className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground"
            >
              <input
                type="checkbox"
                name="avarias"
                value={item}
                defaultChecked={avariasSet.has(item)}
                className="h-5 w-5 rounded border-border accent-[var(--brand)]"
              />
              {item}
            </label>
          ))}
        </div>
      </div>

      {/* Observações */}
      <FormField label="Observações (opcional)" htmlFor="observacoes">
        <Textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          defaultValue={checklist?.observacoes ?? ""}
          placeholder="Ex.: risco na porta traseira direita, farol trincado..."
        />
      </FormField>

      <div className="flex items-center gap-3 pt-1">
        <SubmitButton pendingText="Salvando...">Salvar checklist</SubmitButton>
        {checklist?.updatedAt && (
          <span className="text-xs text-muted">
            Salvo em {formatDateTimeBR(checklist.updatedAt, tz)}
          </span>
        )}
      </div>
    </form>
  );
}
