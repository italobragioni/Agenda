"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, MessageCircle, Copy, Check, Save, Loader2 } from "lucide-react";
import { formatCents, parseCurrencyToCents } from "@/lib/money";
import { normalizePhone, whatsappLink } from "@/lib/phone";
import { buildQuoteMessage } from "./message";
import { saveQuote } from "./actions";

interface Item {
  desc: string;
  price: string; // texto digitado (ex.: "80,00")
}

interface ServiceLite {
  id: string;
  name: string;
  price_cents: number;
}

function centsToInput(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function QuoteBuilder({
  businessName,
  services,
}: {
  businessName: string;
  services: ServiceLite[];
}) {
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [items, setItems] = useState<Item[]>([{ desc: "", price: "" }]);
  const [note, setNote] = useState("");
  const [validity, setValidity] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  const parsedItems = useMemo(
    () =>
      items
        .map((it) => ({
          desc: it.desc.trim(),
          cents: parseCurrencyToCents(it.price) ?? 0,
        }))
        .filter((it) => it.desc !== "" || it.cents > 0),
    [items],
  );

  const totalCents = parsedItems.reduce((sum, it) => sum + it.cents, 0);

  function setItem(i: number, field: keyof Item, value: string) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));
  }
  function addItem() {
    setItems((prev) => [...prev, { desc: "", price: "" }]);
  }
  function removeItem(i: number) {
    setItems((prev) =>
      prev.length === 1 ? [{ desc: "", price: "" }] : prev.filter((_, idx) => idx !== i),
    );
  }
  function addService(s: ServiceLite) {
    const newItem = { desc: s.name, price: centsToInput(s.price_cents) };
    setItems((prev) => {
      // Se o primeiro item estiver vazio, substitui; senão, adiciona.
      if (prev.length === 1 && prev[0].desc === "" && prev[0].price === "") {
        return [newItem];
      }
      return [...prev, newItem];
    });
  }

  const message = useMemo(
    () =>
      buildQuoteMessage({
        businessName,
        clientName,
        items: parsedItems,
        note,
        validity,
        totalCents,
      }),
    [businessName, clientName, parsedItems, note, validity, totalCents],
  );

  const canSend = parsedItems.length > 0;
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

  function handleSave() {
    setSaveError(null);
    startSaving(async () => {
      const res = await saveQuote({
        clientName,
        clientPhone,
        items: parsedItems,
        note,
        validity,
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        router.refresh();
      } else {
        setSaveError(res.error ?? "Não foi possível salvar.");
      }
    });
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-brand focus:outline-2 focus:outline-brand";

  return (
    <div className="space-y-5">
      {/* Cliente */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Para quem é o orçamento?</h2>
        <div>
          <label htmlFor="q-name" className="mb-1 block text-xs font-medium text-muted">
            Nome do cliente (opcional)
          </label>
          <input id="q-name" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ex.: João" className={inputClass} />
        </div>
        <div>
          <label htmlFor="q-phone" className="mb-1 block text-xs font-medium text-muted">
            WhatsApp do cliente (opcional)
          </label>
          <input id="q-phone" type="tel" inputMode="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="(31) 99999-9999" className={inputClass} />
          <p className="mt-1 text-xs text-muted">
            Com o número, o orçamento vai direto pra esse contato. Sem o número, você escolhe o contato no WhatsApp.
          </p>
        </div>
      </div>

      {/* Itens */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Itens do orçamento</h2>

        {/* Atalho: serviços cadastrados */}
        {services.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">
              Toque para adicionar um serviço cadastrado:
            </p>
            <div className="flex flex-wrap gap-2">
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => addService(s)}
                  className="tap inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-brand hover:bg-slate-50"
                >
                  <Plus className="h-3 w-3 text-brand" aria-hidden />
                  {s.name} · {formatCents(s.price_cents)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <input value={it.desc} onChange={(e) => setItem(i, "desc", e.target.value)} placeholder="Descrição (ex.: Lavagem completa)" className={inputClass} />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted">R$</span>
                  <input value={it.price} onChange={(e) => setItem(i, "price", e.target.value)} inputMode="decimal" placeholder="0,00" className={inputClass} />
                </div>
              </div>
              <button type="button" aria-label="Remover item" onClick={() => removeItem(i)} className="tap mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500 hover:bg-red-50">
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addItem} className="tap inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-brand hover:bg-slate-50">
          <Plus className="h-4 w-4" aria-hidden />
          Adicionar item
        </button>
      </div>

      {/* Observações e validade */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <div>
          <label htmlFor="q-note" className="mb-1 block text-xs font-medium text-muted">Observações (opcional)</label>
          <textarea id="q-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Ex.: Inclui produtos. Agende pelo nosso link." className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:border-brand focus:outline-2 focus:outline-brand" />
        </div>
        <div>
          <label htmlFor="q-validity" className="mb-1 block text-xs font-medium text-muted">Validade do orçamento (opcional)</label>
          <input id="q-validity" value={validity} onChange={(e) => setValidity(e.target.value)} placeholder="Ex.: 7 dias" className={inputClass} />
        </div>
      </div>

      {/* Total + prévia */}
      <div className="rounded-2xl border border-brand/30 bg-brand-soft p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Total</span>
          <span className="text-xl font-semibold text-foreground">{formatCents(totalCents)}</span>
        </div>
        <div className="mt-3 whitespace-pre-wrap rounded-xl bg-card p-3 text-xs text-muted">{message}</div>
      </div>

      {saveError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</p>
      )}

      {/* Ações */}
      <div className="flex flex-col gap-2">
        <a
          href={canSend ? waHref : undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!canSend}
          onClick={(e) => {
            if (!canSend) e.preventDefault();
          }}
          className={`tap flex h-12 items-center justify-center gap-2 rounded-xl text-base font-semibold text-white shadow-soft ${
            canSend ? "bg-green-600 hover:bg-green-700" : "cursor-not-allowed bg-green-600/50"
          }`}
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          Enviar no WhatsApp
        </a>
        <div className="flex gap-2">
          <button type="button" onClick={handleSave} disabled={!canSend || saving} className="tap flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-slate-50 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : saved ? <Check className="h-4 w-4" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
            {saved ? "Salvo!" : "Salvar orçamento"}
          </button>
          <button type="button" onClick={copyMsg} disabled={!canSend} className="tap flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-slate-50 disabled:opacity-50">
            {copied ? <><Check className="h-4 w-4" aria-hidden /> Copiado!</> : <><Copy className="h-4 w-4" aria-hidden /> Copiar</>}
          </button>
        </div>
      </div>
    </div>
  );
}
