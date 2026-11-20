"use client";

import { useTransition } from "react";
import { MessageCircle, FileDown, Trash2, Loader2 } from "lucide-react";
import { formatCents } from "@/lib/money";
import { formatDateBR } from "@/lib/datetime";
import { normalizePhone, whatsappLink } from "@/lib/phone";
import { buildQuoteMessage } from "./message";
import { deleteQuote } from "./actions";
import type { Quote } from "@/types/database";

function QuoteRow({ quote, businessName, tz }: { quote: Quote; businessName: string; tz: string }) {
  const [deleting, startDelete] = useTransition();

  const phoneNorm = quote.client_phone ? normalizePhone(quote.client_phone) : null;

  function sendWhatsApp() {
    const message = buildQuoteMessage({
      businessName,
      clientName: quote.client_name,
      items: quote.items,
      note: quote.note,
      validity: quote.validity,
      totalCents: quote.total_cents,
      pdfUrl: `${window.location.origin}/o/${quote.id}/pdf`,
    });
    const wa = phoneNorm
      ? whatsappLink(phoneNorm, message)
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(wa, "_blank");
  }

  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {quote.client_name || "Sem nome"}
          </p>
          <p className="text-xs text-muted">
            {formatDateBR(quote.created_at, tz)} · {quote.items.length}{" "}
            {quote.items.length === 1 ? "item" : "itens"}
          </p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-foreground">
          {formatCents(quote.total_cents)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <button
          type="button"
          onClick={sendWhatsApp}
          className="tap inline-flex items-center gap-1 rounded-lg bg-green-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          WhatsApp
        </button>
        <a
          href={`/orcamento/${quote.id}/pdf?download=1`}
          className="tap inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-slate-50"
        >
          <FileDown className="h-3.5 w-3.5" aria-hidden />
          Baixar PDF
        </a>
        <button
          type="button"
          onClick={() => {
            if (confirm("Excluir este orçamento?")) {
              startDelete(() => deleteQuote(quote.id));
            }
          }}
          disabled={deleting}
          className="tap ml-auto inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Trash2 className="h-3.5 w-3.5" aria-hidden />}
          Excluir
        </button>
      </div>
    </li>
  );
}

export function QuoteHistory({
  quotes,
  businessName,
  tz,
}: {
  quotes: Quote[];
  businessName: string;
  tz: string;
}) {
  if (quotes.length === 0) return null;
  return (
    <div className="mt-8">
      <h2 className="mb-3 text-sm font-semibold text-foreground">
        Orçamentos salvos
      </h2>
      <ul className="space-y-2">
        {quotes.map((q) => (
          <QuoteRow key={q.id} quote={q} businessName={businessName} tz={tz} />
        ))}
      </ul>
    </div>
  );
}
