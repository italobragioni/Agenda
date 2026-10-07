import { z } from "zod";

/** Convite de um novo membro da equipe (funcionário). */
export const inviteSchema = z.object({
  full_name: z.string().trim().min(2, "Informe o nome"),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});
