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
  /** Quantos atendimentos simultâneos o estabelecimento suporta (boxes). */
  capacity?: number;
  /**
   * Horários fixos de marcação (em UTC). Quando informado (não vazio), só esses
   * horários de início são oferecidos (ex.: 08:00 e 13:00). Vazio/ausente =
   * oferece de `stepMin` em `stepMin` (comportamento padrão).
   */
  fixedStartsUtc?: Date[];
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
    fixedStartsUtc,
  } = opts;
  const capacity = Math.max(1, opts.capacity ?? 1);

  if (!openUtc || !closeUtc || durationMin <= 0 || stepMin <= 0) return [];

  const open = openUtc.getTime();
  const close = closeUtc.getTime();
  const nowMs = now.getTime();

  // Monta a lista de horários candidatos de início.
  let candidates: number[];
  if (fixedStartsUtc && fixedStartsUtc.length > 0) {
    // Só os horários fixos que começam dentro do funcionamento.
    candidates = fixedStartsUtc
      .map((d) => d.getTime())
      .filter((t) => t >= open)
      .sort((a, b) => a - b);
  } else {
    candidates = [];
    for (let t = open; t + durationMin * MIN <= close; t += stepMin * MIN) {
      candidates.push(t);
    }
  }

  const slots: Date[] = [];
  for (const start of candidates) {
    const end = start + durationMin * MIN;
    if (end > close) continue; // o serviço ultrapassaria o fechamento
    if (start <= nowMs) continue; // no passado

    // Bloqueios (inclui almoço): ocupam todo o estabelecimento.
    if (blocked.some((b) => overlaps(start, end, b, 0))) continue;

    // Conta quantos agendamentos já ocupam esse período (com intervalo).
    // Só bloqueia quando atingir a capacidade (número de boxes).
    let conflicts = 0;
    for (const a of existing) {
      if (overlaps(start, end, a, intervalMin)) conflicts += 1;
    }
    if (conflicts >= capacity) continue;

    slots.push(new Date(start));
  }

  return slots;
}
