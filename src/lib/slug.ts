/**
 * Gera um "slug" a partir de um texto: minúsculas, sem acentos, com hífens.
 * Ex.: "Estética Premium" -> "estetica-premium"
 */
export function slugify(text: string): string {
  return (text || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove símbolos
    .replace(/[\s_-]+/g, "-") // espaços -> hífen
    .replace(/^-+|-+$/g, ""); // remove hífens das pontas
}
