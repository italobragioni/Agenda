import { CalendarCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-brand-foreground">
          <CalendarCheck className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Agenda
        </h1>
        <p className="mt-2 text-sm text-muted">
          Agendamento simples para lava-jatos, detalhamento e estética
          automotiva.
        </p>
        <p className="mt-6 rounded-lg bg-background px-3 py-2 text-xs text-muted">
          Projeto iniciado com sucesso. Próximas etapas: banco de dados,
          autenticação e agenda.
        </p>
      </div>
    </main>
  );
}
