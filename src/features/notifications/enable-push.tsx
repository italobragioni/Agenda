"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Check, Loader2 } from "lucide-react";
import { savePushSubscription, removePushSubscription } from "./actions";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

/** Converte a chave pública VAPID (base64url) para o formato do navegador. */
function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const buffer = new ArrayBuffer(raw.length);
  const out = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type State = "loading" | "unsupported" | "off" | "on" | "denied" | "busy";

export function EnablePush() {
  const [state, setState] = useState<State>("loading");
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window) ||
      !VAPID_PUBLIC
    ) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? "on" : "off"))
      .catch(() => setState("off"));
  }, []);

  async function enable() {
    setError(undefined);
    setState("busy");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      });
      const json = sub.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };
      const res = await savePushSubscription({
        endpoint: json.endpoint,
        keys: json.keys,
      });
      if (!res.ok) throw new Error("save");
      setState("on");
    } catch {
      setError("Não foi possível ativar. Tente novamente.");
      setState("off");
    }
  }

  async function disable() {
    setState("busy");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setState("off");
    } catch {
      setState("on");
    }
  }

  if (state === "loading") return null;

  if (state === "unsupported") {
    return (
      <div className="rounded-2xl border border-border bg-card px-4 py-3.5">
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          <BellOff className="h-5 w-5 text-muted" aria-hidden />
          Notificações no celular
        </p>
        <p className="mt-1 text-xs text-muted">
          Para receber no iPhone, primeiro instale o app na tela inicial
          (Menu → Instalar aplicativo) e abra por ele.
        </p>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="rounded-2xl border border-border bg-card px-4 py-3.5">
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          <BellOff className="h-5 w-5 text-muted" aria-hidden />
          Notificações bloqueadas
        </p>
        <p className="mt-1 text-xs text-muted">
          Você bloqueou as notificações. Libere nas configurações do navegador
          (ou do app) para receber avisos de novos agendamentos.
        </p>
      </div>
    );
  }

  if (state === "on") {
    return (
      <div className="rounded-2xl border border-brand/30 bg-brand-soft px-4 py-3.5">
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Check className="h-5 w-5 text-green-600" aria-hidden />
          Notificações ativadas neste aparelho
        </p>
        <button
          type="button"
          onClick={disable}
          className="mt-1 text-xs font-medium text-muted hover:text-foreground"
        >
          Desativar neste aparelho
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={enable}
      disabled={state === "busy"}
      className="tap flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-left hover:bg-slate-50 disabled:opacity-60"
    >
      {state === "busy" ? (
        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-brand" aria-hidden />
      ) : (
        <Bell className="h-5 w-5 shrink-0 text-brand" aria-hidden />
      )}
      <span className="flex-1">
        <span className="block text-sm font-medium text-foreground">
          Ativar notificações no celular
        </span>
        <span className="block text-xs text-muted">
          Receba um aviso a cada novo agendamento, mesmo com o app fechado.
        </span>
        {error && <span className="block text-xs text-red-600">{error}</span>}
      </span>
    </button>
  );
}
