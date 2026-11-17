/**
 * Gerador do "Pix Copia e Cola" (BR Code / padrão EMV do Banco Central).
 *
 * Função pura, sem dependências. Produz a string que o cliente cola no app do
 * banco — já com o valor do agendamento preenchido. O mesmo texto vira o QR.
 */

/** Remove acentos, deixa só ASCII, maiúsculas, e limita o tamanho. */
function sanitize(text: string, max: number): string {
  return (text || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // tira acentos
    .replace(/[^\x20-\x7E]/g, "") // só ASCII imprimível
    .toUpperCase()
    .trim()
    .slice(0, max);
}

/** Campo EMV: id (2) + tamanho (2) + valor. */
function field(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

/** CRC16-CCITT (polinômio 0x1021, início 0xFFFF) — exigido pelo padrão. */
function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Monta o Pix Copia e Cola.
 * @param key   Chave Pix (CPF/CNPJ só números, celular como +5531..., e-mail ou aleatória).
 * @param name  Nome do recebedor (máx. 25 caracteres no código).
 * @param city  Cidade do recebedor (máx. 15 caracteres no código).
 * @param amountCents  Valor em centavos (opcional; 0/ausente = sem valor fixo).
 */
export function buildPixPayload(opts: {
  key: string;
  name: string;
  city: string;
  amountCents?: number | null;
  txid?: string;
}): string {
  const key = (opts.key || "").trim();
  const name = sanitize(opts.name, 25) || "RECEBEDOR";
  const city = sanitize(opts.city, 15) || "BRASIL";

  const merchantAccount = field(
    "26",
    field("00", "br.gov.bcb.pix") + field("01", key),
  );
  const amount =
    opts.amountCents && opts.amountCents > 0
      ? field("54", (opts.amountCents / 100).toFixed(2))
      : "";
  const additional = field("62", field("05", opts.txid || "***"));

  const partial =
    field("00", "01") + // Payload Format Indicator
    merchantAccount +
    field("52", "0000") + // Merchant Category Code
    field("53", "986") + // Moeda = BRL
    amount +
    field("58", "BR") + // País
    field("59", name) +
    field("60", city) +
    additional +
    "6304"; // id + tamanho do CRC

  return partial + crc16(partial);
}
