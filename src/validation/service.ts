import { z } from "zod";
import { parseCurrencyToCents } from "@/lib/money";

/**
 * Valida o formulário de serviço. Preço chega como texto (ex.: "80,00") e é
 * convertido para centavos; duração chega como texto e vira minutos.
 */
export const serviceSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do serviço"),
  description: z
    .string()
    .trim()
    .max(500, "Descrição muito longa")
    .optional()
    .transform((v) => (v ? v : null)),
  price_cents: z
    .string()
    .transform((v) => parseCurrencyToCents(v))
    .refine((v): v is number => v !== null && v >= 0, "Preço inválido"),
  duration_minutes: z
    .string()
    .transform((v) => Number(String(v).replace(/\D/g, "")))
    .refine((v) => Number.isInteger(v) && v > 0, "Duração inválida"),
  is_active: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
