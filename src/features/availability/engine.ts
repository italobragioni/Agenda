/**
 * Motor de disponibilidade (função pura, sem dependência de banco).
 *
 * Dado o horário de funcionamento do dia, a duração do serviço, o intervalo
 * entre clientes, os agendamentos existentes e os bloqueios, calcula os
 * horários de início disponíveis.
 *
 * Regras:
 *  - o serviço não pode ultrapassar o horário de fechamento;
 *  - não pode sobrepor um bloqueio;
 *  - deve respeitar um intervalo (folga) antes/depois de outros agendamentos;
 *  - não mostra horários no passado (comparando com "now").
 */

export interface Interval {
  start: Date;
  end: Date;
}

const MIN = 60_000;

/** Há sobreposição entre [aStart,aEnd) e [bStart-gap, bEnd+gap)? (meio-aberto) */
function overlaps(
  aStart: number,
  aEnd: number,
  b: Interval,
  gapMin: number,
): boolean {
  const bStart = b.start.getTime() - gapMin * MIN;
  const bEnd = b.end.getTime() + gapMin * MIN;
  return aStart < bEnd && bStart < aEnd;
}

export function computeAvailableSlots(opts: {
  openUtc: Date | null;
  closeUtc: Date | null;
  durationMin: number;
  intervalMin: number;
  stepMin: number;
  existing: Interval[];
  blocked: Interval[];
  now: Date;
}): Date[] {
  const {
    openUtc,
    closeUtc,
    durationMin,
    intervalMin,
    stepMin,
    existing,
    blocked,
    now,
  } = opts;

  if (!openUtc || !closeUtc || durationMin <= 0 || stepMin <= 0) return [];

  const slots: Date[] = [];
  const close = closeUtc.getTime();
  const nowMs = now.getTime();

  for (let t = openUtc.getTime(); ; t += stepMin * MIN) {
    const start = t;
    const end = t + durationMin * MIN;
    if (end > close) break; // ultrapassaria o fechamento
    if (start <= nowMs) continue; // no passado

    // Bloqueios: sem folga.
    if (blocked.some((b) => overlaps(start, end, b, 0))) continue;

    // Agendamentos existentes: respeitando o intervalo entre clientes.
    if (existing.some((a) => overlaps(start, end, a, intervalMin))) continue;

    slots.push(new Date(start));
  }

  return slots;
}
