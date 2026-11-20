"use client";

import { useMemo, useState } from "react";
import { Plus, X, MessageCircle, Copy, Check } from "lucide-react";
import { formatCents, parseCurrencyToCents } from "@/lib/money";
import { normalizePhone, whatsappLink } from "@/lib/phone";

interface Item {
  desc: string;
  price: string; // texto digitado (ex.: "80,00")
}

export function QuoteBuilder({ businessName }: { businessName: string }) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [items, setItems] = useState<Item[]>([{ desc: "", price: "" }]);
  const [note, setNote] = useState("");
  const [validity, setValidity] = useState("");
  const [copied, setCopied] = useState(false);

  const totalCents = useMemo(
    () =>
      items.reduce((sum, it) => sum + (parseCurrencyToCents(it.price) ?? 0), 0),
    [items],
  );

  const filledItems = items.filter(
    (it) => it.desc.trim() !== "" || parseCurrencyToCents(it.price),
  );

  function setItem(i: number, field: keyof Item, value: string) {
    setItems((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)),
    );
  }
  function addItem() {
    setItems((prev) => [...prev, { desc: "", price: "" }]);
  }
  function removeItem(i: number) {
    setItems((prev) =>
      prev.length === 1 ? [{ desc: "", price: "" }] : prev.filter((_, idx) => idx !== i),
    );
  }

  const message = useMemo(() => {
    const lines: string[] = [];
    lines.push(`*Orçamento — ${businessName}*`);
    lines.push("");
    lines.push(
      clientName.trim()
        ? `Olá, ${clientName.trim()}! Segue seu orçamento:`
        : "Segue seu orçamento:",
    );
    lines.push("");
    for (const it of filledItems) {
      const cents = parseCurrencyToCents(it.price);
      const desc = it.desc.trim() || "Item";
      lines.push(cents ? `• ${desc}: ${formatCents(cents)}` : `• ${desc}`);
    }
    lines.push("");
    lines.push(`*Total: ${formatCents(totalCents)}*`);
    if (note.trim()) {
      lines.push("");
      lines.push(note.trim());
    }
    if (validity.trim()) {
      lines.push("");
      lines.push(`Validade: ${validity.trim()}`);
    }
    lines.push("");
    lines.push("Qualquer dúvida, estou à disposição!");
    return lines.join("\n");
  }, [businessName, clientName, filledItems, totalCents, note, validity]);

  const canSend = filledItems.length > 0;

  const phoneNorm = normalizePhone(clientPhone);
  const waHref = phoneNorm
    ? whatsappLink(phoneNorm, message)
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  async function copyMsg() {
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = message;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {}
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-brand focus:outline-2 focus:outline-brand";

  return (
    <div className="space-y-5">
      {/* Cliente */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">
          Para quem é o orçamento?
        </h2>
        <div>
          <label htmlFor="q-name" className="mb-1 block text-xs font-medium text-muted">
            Nome do cliente (opcional)
          </label>
          <input
            id="q-name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Ex.: João"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="q-phone" className="mb-1 block text-xs font-medium text-muted">
            WhatsApp do cliente (opcional)
          </label>
          <input
            id="q-phone"
            type="tel"
            inputMode="tel"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            placeholder="(31) 99999-9999"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-muted">
            Com o número, o orçamento vai direto pra esse contato. Sem o número,
            você escolhe o contato no WhatsApp.
          </p>
        </div>
      </div>

      {/* Itens */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Itens do orçamento</h2>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <input
                  value={it.desc}
                  onChange={(e) => setItem(i, "desc", e.target.value)}
                  placeholder="Descrição (ex.: Lavagem completa)"
                  className={inputClass}
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted">R$</span>
                  <input
                    value={it.price}
                    onChange={(e) => setItem(i, "price", e.target.value)}
                    inputMode="decimal"
                    placeholder="0,00"
                    className={inputClass}
                  />
                </div>
              </div>
              <button
                type="button"
                aria-label="Remover item"
                onClick={() => removeItem(i)}
                className="tap mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="tap inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-brand hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Adicionar item
        </button>
      </div>

      {/* Observações e validade */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <div>
          <label htmlFor="q-note" className="mb-1 block text-xs font-medium text-muted">
            Observações (opcional)
          </label>
          <textarea
            id="q-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Ex.: Inclui produtos. Agende pelo nosso link."
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:border-brand focus:outline-2 focus:outline-brand"
          />
        </div>
        <div>
          <label htmlFor="q-validity" className="mb-1 block text-xs font-medium text-muted">
            Validade do orçamento (opcional)
          </label>
          <input
            id="q-validity"
            value={validity}
            onChange={(e) => setValidity(e.target.value)}
            placeholder="Ex.: 7 dias"
            className={inputClass}
          />
        </div>
      </div>

      {/* Total + prévia */}
      <div className="rounded-2xl border border-brand/30 bg-brand-soft p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Total</span>
          <span className="text-xl font-semibold text-foreground">
            {formatCents(totalCents)}
          </span>
        </div>
        <div className="mt-3 whitespace-pre-wrap rounded-xl bg-card p-3 text-xs text-muted">
          {message}
        </div>
      </div>

      {/* Ações */}
      <div className="sticky bottom-3 flex flex-col gap-2">
        <a
          href={canSend ? waHref : undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!canSend}
          onClick={(e) => {
            if (!canSend) e.preventDefault();
          }}
          className={`tap flex h-12 items-center justify-center gap-2 rounded-xl text-base font-semibold text-white shadow-soft ${
            canSend
              ? "bg-green-600 hover:bg-green-700"
              : "cursor-not-allowed bg-green-600/50"
          }`}
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          Enviar no WhatsApp
        </a>
        <button
          type="button"
          onClick={copyMsg}
          disabled={!canSend}
          className="tap flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-slate-50 disabled:opacity-50"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" aria-hidden /> Copiado!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden /> Copiar texto
            </>
          )}
        </button>
      </div>
    </div>
  );
}
