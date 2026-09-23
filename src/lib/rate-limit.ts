/**
 * Rate limit simples em memória (best-effort).
 *
 * Observação: em ambiente serverless a memória não é compartilhada entre
 * instâncias, então isto é apenas uma proteção leve contra abuso/duplo
 * envio. Uma proteção robusta (ex.: Upstash/Redis) pode ser adicionada na
 * Fase 2 do produto.
 */

const hits = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    hits.set(key, arr);
    return false; // excedeu
  }
  arr.push(now);
  hits.set(key, arr);
  return true; // permitido
}
