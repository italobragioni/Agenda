"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

const LAST_SEEN_KEY = "carvi:notif:lastSeen";

/**
 * Sininho de notificações: mostra um contador de agendamentos online novos
 * (ainda não vistos). "Visto" é marcado ao abrir a página de notificações.
 */
export function NotificationBell({ timestamps }: { timestamps: string[] }) {
  const [unseen, setUnseen] = useState(0);

  useEffect(() => {
    let lastSeen = "";
    try {
      lastSeen = localStorage.getItem(LAST_SEEN_KEY) || "";
    } catch {
      lastSeen = "";
    }
    setUnseen(timestamps.filter((t) => t > lastSeen).length);
  }, [timestamps]);

  return (
    <Link
      href="/notificacoes"
      aria-label="Notificações"
      className="tap relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-slate-50"
    >
      <Bell className="h-5 w-5" aria-hidden />
      {unseen > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-semibold text-white">
          {unseen > 9 ? "9+" : unseen}
        </span>
      )}
    </Link>
  );
}

/** Marca as notificações como vistas (guarda o horário do mais recente). */
export function MarkNotificationsSeen({ latest }: { latest: string }) {
  useEffect(() => {
    try {
      localStorage.setItem(LAST_SEEN_KEY, latest);
    } catch {
      // ignora
    }
  }, [latest]);
  return null;
}
