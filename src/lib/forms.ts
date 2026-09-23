import type { z } from "zod";

/** Estado padrão retornado pelas Server Actions de formulário. */
export interface ActionState {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
}

/** Achata os erros do Zod em um mapa campo -> primeira mensagem. */
export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  const fieldErrors = error.flatten().fieldErrors as Record<
    string,
    string[] | undefined
  >;
  for (const [key, msgs] of Object.entries(fieldErrors)) {
    if (msgs && msgs.length > 0) out[key] = msgs[0];
  }
  return out;
}
