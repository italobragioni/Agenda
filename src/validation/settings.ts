import { z } from "zod";
import { normalizePhone } from "@/lib/phone";

export const businessInfoSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do estabelecimento"),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : ""))
    .refine((v) => v === "" || normalizePhone(v) !== null, "Telefone inválido"),
  whatsapp: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : ""))
    .refine((v) => v === "" || normalizePhone(v) !== null, "WhatsApp inválido"),
});

export const slugSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3, "O apelido deve ter ao menos 3 caracteres")
    .max(40, "Apelido muito longo"),
});
