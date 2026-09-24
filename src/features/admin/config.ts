/**
 * E-mails com acesso à área de administrador da Carvi (dono do sistema).
 * Pode ser configurado pela variável ADMIN_EMAILS (separados por vírgula);
 * caso não exista, usa o padrão abaixo.
 */
const DEFAULT_ADMINS = ["italobragioni@gmail.com"];

export function adminEmails(): string[] {
  const env = process.env.ADMIN_EMAILS;
  const list = env
    ? env.split(",").map((e) => e.trim().toLowerCase())
    : DEFAULT_ADMINS;
  return list.filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}
