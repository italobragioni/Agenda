import type { AppointmentStatus } from "@/types/database";

interface StatusInfo {
  label: string;
  /** Classes Tailwind para um "badge" (não depende só de cor: tem texto). */
  badgeClass: string;
}

export const STATUS_INFO: Record<AppointmentStatus, StatusInfo> = {
  scheduled: {
    label: "Agendado",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  in_progress: {
    label: "Em atendimento",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  completed: {
    label: "Finalizado",
    badgeClass: "bg-green-50 text-green-700 border-green-200",
  },
  cancelled: {
    label: "Cancelado",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
  },
  no_show: {
    label: "Não compareceu",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
  },
};

export function statusLabel(status: AppointmentStatus): string {
  return STATUS_INFO[status].label;
}
