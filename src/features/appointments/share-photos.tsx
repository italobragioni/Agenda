"use client";

import { useState } from "react";
import { MessageCircle, Copy, Check, Share2 } from "lucide-react";
import { normalizePhone, whatsappLink } from "@/lib/phone";

/**
 * Bloco para o dono compartilhar as fotos com o cliente (link público).
 * O cliente abre /f/[id] e vê as fotos sem precisar de login.
 */
export function SharePhotos({
  appointmentId,
  customerPhone,
  businessName,
  hasPhotos,
}: {
  appointmentId: string;
  customerPhone: string | null;
  businessName: string;
  hasPhotos: boolean;
}) {
  const [copied, setCopied] = useState(false);

  function link() {
    return `${window.location.origin}/f/${appointmentId}`;
  }

  function sendWhatsApp() {
    const msg = `Olá! Seguem as fotos do seu atendimento em ${businessName}:\n${link()}`;
    const phoneNorm = customerPhone ? normalizePhone(customerPhone) : null;
    const wa = phoneNorm
      ? whatsappLink(phoneNorm, msg)
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(wa, "_blank");
  }

  async function copyLink() {
    const url = link();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
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

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <Share2 className="h-4 w-4 text-brand" aria-hidden />
        Compartilhar com o cliente
      </p>
      <p className="mt-1 text-xs text-muted">
        O cliente abre o link e vê as fotos a qualquer momento, mesmo depois de
        finalizar o atendimento.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={sendWhatsApp}
          disabled={!hasPhotos}
          className="tap flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Enviar no WhatsApp
        </button>
        <button
          type="button"
          onClick={copyLink}
          disabled={!hasPhotos}
          className="tap flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-slate-50 disabled:opacity-50"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" aria-hidden /> Copiado!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden /> Copiar link
            </>
          )}
        </button>
      </div>
      {!hasPhotos && (
        <p className="mt-2 text-xs text-muted">
          Adicione ao menos uma foto para poder compartilhar.
        </p>
      )}
    </div>
  );
}
