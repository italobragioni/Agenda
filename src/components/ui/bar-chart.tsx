import { formatCents } from "@/lib/money";

export interface BarDatum {
  key: string;
  /** Rótulo curto do eixo (ex.: "23/09"). */
  label: string;
  /** Rótulo acessível completo (ex.: "23/09/2026"). */
  fullLabel: string;
  value: number; // centavos
}

/**
 * Gráfico de barras simples (faturamento por dia).
 * Acessível: cada barra tem rótulo textual; não depende só de cor.
 */
export function BarChart({ data }: { data: BarDatum[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted">
        Sem faturamento no período.
      </p>
    );
  }

  // Mostra rótulos do eixo esparsos quando há muitas barras.
  const step = data.length > 10 ? Math.ceil(data.length / 6) : 1;

  return (
    <div>
      <div
        className="flex h-40 items-end gap-1"
        role="img"
        aria-label="Gráfico de faturamento por dia"
      >
        {data.map((d) => {
          const heightPct = Math.round((d.value / max) * 100);
          return (
            <div
              key={d.key}
              className="flex flex-1 flex-col items-center justify-end"
              title={`${d.fullLabel}: ${formatCents(d.value)}`}
            >
              <div
                className="w-full rounded-t bg-brand"
                style={{ height: `${d.value === 0 ? 2 : Math.max(heightPct, 4)}%` }}
                aria-hidden
              />
            </div>
          );
        })}
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
