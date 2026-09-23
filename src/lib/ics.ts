/** Gera o conteúdo de um arquivo .ics (evento de calendário). */
export function buildIcs(opts: {
  title: string;
  startIso: string;
  endIso: string;
  description?: string;
  location?: string;
}): string {
  const fmt = (iso: string) =>
    new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const uid = `${Date.now()}@agenda`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Agenda//PT-BR//",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${fmt(new Date().toISOString())}`,
    `DTSTART:${fmt(opts.startIso)}`,
    `DTEND:${fmt(opts.endIso)}`,
    `SUMMARY:${opts.title}`,
    opts.description ? `DESCRIPTION:${opts.description}` : "",
    opts.location ? `LOCATION:${opts.location}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return lines.join("\r\n");
}

/** Cria uma URL de download (data URI) para um arquivo .ics. */
export function icsDataUrl(content: string): string {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(content)}`;
}
