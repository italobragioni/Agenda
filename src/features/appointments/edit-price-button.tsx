"use client";

import { useActionState, useEffect, useState } from "react";
import { Tag, X, Loader2 } from "lucide-react";
import { updateAppointmentPrice } from "./actions";
import type { ActionState } from "@/lib/forms";

function centsToInput(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Botão "Preço" que abre uma caixinha para editar o valor do atendimento. */
export function EditPriceButton({
  id,
  priceCents,
}: {
  id: string;
  priceCents: number;
}) {
  const [open, setOpen] = useState(false);
  const action = updateAppointmentPrice.bind(null, id);
  const [state, formAction, pending] = useActionState(
    action,
    {} as ActionState,
  );

  // Fecha a caixinha quando o preço é salvo com sucesso.
  useEffect(() => {
    if (state.success) setOpen(false);
  }, [state]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="tap inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-slate-50"
      >
        <Tag className="h-3.5 w-3.5" aria-hidden />
        Preço
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xs rounded-2xl bg-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                Editar preço
              </h3>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setOpen(false)}
                className="tap text-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form action={formAction} className="space-y-3">
              <label
                htmlFor="price"
                className="block text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Valor (R$)
              </label>
              <input
                id="price"
                name="price"
                inputMode="decimal"
                autoFocus
                defaultValue={centsToInput(priceCents)}
                placeholder="0,00"
                className="h-12 w-full rounded-xl border border-border bg-slate-50 px-3.5 text-[15px] text-foreground focus:border-brand focus:bg-card focus:outline-2 focus:outline-offset-0 focus:outline-brand"
              />
              {(state.fieldErrors?.price || state.error) && (
                <p className="text-xs text-red-600">
                  {state.fieldErrors?.price ?? state.error}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="tap h-11 flex-1 rounded-xl border border-border bg-card text-sm font-semibold text-foreground hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="tap flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-brand-foreground hover:bg-brand-hover disabled:opacity-60"
                >
                  {pending && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  )}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
