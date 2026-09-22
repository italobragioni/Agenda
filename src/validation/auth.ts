import { z } from "zod";
import { normalizePhone } from "@/lib/phone";

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Informe o telefone")
  .refine((v) => normalizePhone(v) !== null, "Telefone inválido");

export const signupSchema = z.object({
  ownerName: z.string().trim().min(2, "Informe o nome do responsável"),
  businessName: z.string().trim().min(2, "Informe o nome do estabelecimento"),
  phone: phoneSchema,
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
    confirm: z.string().min(1, "Confirme a senha"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
