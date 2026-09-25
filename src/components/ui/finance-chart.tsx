import { formatCents } from "@/lib/money";

export interface FinanceBar {
  key: string;
  label: string;
  fullLabel: string;
  income: number; // entradas (centavos): faturamento + outras entradas
  expense: number; // saídas (centavos)
}

/**
 * Gráfico de barras de entradas × saídas por dia.
 * Acessível: cada barra tem título textual; legenda com texto, não só cor.
 */
export function FinanceChart({ data }: { data: FinanceBar[] }) {
  const max = Math.max(
    1,
    ...data.map((d) => Math.max(d.income, d.expense)),
  );
  const total = data.reduce((s, d) => s + d.income + d.expense, 0);

  if (total === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted">
        Sem movimentação no período.
      </p>
    );
  }

  const step = data.length > 10 ? Math.ceil(data.length / 6) : 1;

  return (
    <div>
      {/* Legenda */}
      <div className="mb-3 flex items-center gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Entradas
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-red-400" /> Saídas
        </span>
      </div>

      <div className="flex h-40 items-end gap-1" role="img" aria-label="Entradas e saídas por dia">
        {data.map((d) => (
          <div
            key={d.key}
            className="flex flex-1 items-end justify-center gap-[2px]"
            title={`${d.fullLabel} — Entradas: ${formatCents(d.income)} · Saídas: ${formatCents(d.expense)}`}
          >
            <div
              className="w-1/2 rounded-t bg-emerald-500"
              style={{ height: `${d.income === 0 ? 0 : Math.max((d.income / max) * 100, 3)}%` }}
              aria-hidden
            />
            <div
              className="w-1/2 rounded-t bg-red-400"
              style={{ height: `${d.expense === 0 ? 0 : Math.max((d.expense / max) * 100, 3)}%` }}
              aria-hidden
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1">
        {data.map((d, i) => (
          <div key={d.key} className="flex-1 text-center">
            <span className="text-[10px] text-muted">
              {i % step === 0 ? d.label : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
