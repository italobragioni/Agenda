/**
 * Junta classes CSS condicionalmente (versão mínima, sem dependências).
 * Aceita strings, ou objetos { classe: condicao }.
 */
export function cn(
  ...inputs: Array<string | undefined | null | false | Record<string, boolean>>
): string {
  const classes: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === "string") {
      classes.push(input);
    } else {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }
  return classes.join(" ");
}
