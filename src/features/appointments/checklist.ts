/** Itens que costumam vir no carro (conferência na chegada). */
export const CHECKLIST_ITENS = [
  "Tapetes",
  "Documento do veículo",
  "Chave reserva",
  "Estepe",
  "Macaco e chave de roda",
  "Triângulo",
  "Som / multimídia",
  "Carregador",
  "Pertences pessoais",
] as const;

/** Estado / avarias observadas na chegada. */
export const CHECKLIST_AVARIAS = [
  "Riscos / arranhões",
  "Amassados",
  "Parabrisa trincado",
  "Faróis / lanternas quebrados",
  "Pneus carecas",
  "Retrovisor danificado",
  "Pintura desbotada",
  "Falta de acessório",
] as const;

/** Níveis de combustível. */
export const CHECKLIST_COMBUSTIVEL = [
  "Reserva",
  "1/4",
  "1/2",
  "3/4",
  "Cheio",
] as const;

export interface Checklist {
  combustivel: string;
  km: string;
  itens: string[];
  avarias: string[];
  observacoes: string;
  updatedAt: string;
}

export function checklistPath(
  businessId: string,
  appointmentId: string,
): string {
  return `${businessId}/${appointmentId}/checklist.json`;
}
