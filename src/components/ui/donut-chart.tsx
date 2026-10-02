import { formatCents } from "@/lib/money";

export interface DonutSlice {
  key: string;
  label: string;
  value: number; // centavos
}

/** Paleta harmônica (tons de azul Carvi + apoio), acessível em claro/escuro. */
const PALETTE = [
  "#0a84ff", // azul Carvi
  "#22c3e6", // ciano
  "#34c759", // verde
  "#ff9f0a", // âmbar
  "#5e5ce6", // índigo
  "#ff375f", // rosa/vermelho
  "#64748b", // cinza (demais)
];

const SIZE = 180;
const STROKE = 26;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;
const CENTER = SIZE / 2;

/**
 * Gráfico de rosca (donut) do faturamento por serviço, com o total no centro.
 * Mostra no máximo 6 fatias; o excedente é agrupado em "Outros".
 * Acessível: legenda textual com valor e porcentagem (não depende só de cor).
 */
export function DonutChart({
  data,
  centerLabel = "Faturamento",
}: {
  data: DonutSlice[];
  centerLabel?: string;
}) {
  const positive = data.filter((d) => d.value > 0);
  const total = positive.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted">
        Sem faturamento no período.
      </p>
    );
  }

  // Agrupa o excedente além das 6 maiores fatias em "Outros".
  const sorted = [...positive].sort((a, b) => b.value - a.value);
  const top = sorted.slice(0, 6);
  const rest = sorted.slice(6);
  const slices: DonutSlice[] =
    rest.length > 0
      ? [
          ...top,
          {
            key: "__outros__",
            label: "Outros",
            value: rest.reduce((s, d) => s + d.value, 0),
          },
        ]
      : top;

  // Soma acumulada antes de cada fatia (sem reatribuir no render).
  const arcs = slices.map((d, i) => {
    const frac = d.value / total;
    const before =
      slices.slice(0, i).reduce((s, x) => s + x.value, 0) / total;
    return {
      ...d,
      color: PALETTE[i % PALETTE.length],
      pct: Math.round(frac * 100),
      dash: frac * C,
      offset: before * C,
    };
  });

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
      {/* Rosca */}
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label="Gráfico de faturamento por serviço"
          className="-rotate-90"
        >
          {/* trilho de fundo */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={R}
            fill="none"
            stroke="var(--border)"
            strokeWidth={STROKE}
          />
          {arcs.map((a) => (
            <circle
              key={a.key}
              cx={CENTER}
              cy={CENTER}
              r={R}
              fill="none"
              stroke={a.color}
              strokeWidth={STROKE}
              strokeDasharray={`${a.dash} ${C - a.dash}`}
              strokeDashoffset={-a.offset}
              strokeLinecap="butt"
            >
              <title>{`${a.label}: ${formatCents(a.value)} (${a.pct}%)`}</title>
            </circle>
          ))}
        </svg>
        {/* Centro com o total */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-medium text-muted">
            {centerLabel}
          </span>
          <span className="text-lg font-bold text-foreground">
            {formatCents(total)}
          </span>
        </div>
      </div>

      {/* Legenda */}
      <ul className="w-full space-y-2">
        {arcs.map((a) => (
          <li key={a.key} className="flex items-center gap-2.5 text-sm">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: a.color }}
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate text-foreground">
              {a.label}
            </span>
            <span className="shrink-0 text-muted">
              {formatCents(a.value)} · {a.pct}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
