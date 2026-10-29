"use client";

import { useEffect, useState } from "react";
import { Download, Share, Plus, X, ChevronRight } from "lucide-react";

// ---------------------------------------------------------------------
// Captura global do evento de instalação (Android/Chrome/Edge).
// Fica em escopo de módulo para não perder o evento, que dispara cedo.
// ---------------------------------------------------------------------
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredPrompt: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((f) => f());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as InstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
  });
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const iOSDevice = /iPad|iPhone|iPod/.test(ua);
  // iPadOS recente se identifica como Mac com toque.
  const iPadOS = /Macintosh/.test(ua) && "ontouchend" in document;
  return iOSDevice || iPadOS;
}

/** Registra o service worker (necessário para a instalação no Android). */
export function PwaBootstrap() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}

/**
 * Botão "Instalar aplicativo".
 * - Android/Chrome: abre a caixa nativa de instalação (1 toque).
 * - iOS/Safari: abre um passo a passo (a Apple não permite instalar por botão).
 */
export function InstallButton({
  variant = "button",
  className,
}: {
  /** "button": botão com descrição (Configurações). "row": linha de menu. */
  variant?: "button" | "row";
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [ios, setIos] = useState(false);
  // Usado só para forçar re-render quando o prompt fica disponível/indisponível.
  const [, setTick] = useState(0);

  useEffect(() => {
    setMounted(true);
    setIos(isIOS());
    setInstalled(isStandalone());
    const update = () => {
      setInstalled(isStandalone());
      setTick((n) => n + 1);
    };
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  // Evita diferença de render entre servidor e cliente.
  if (!mounted || installed) return null;

  async function handleClick() {
    // Android/desktop com prompt disponível: instala direto.
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      try {
        await deferredPrompt.userChoice;
      } catch {
        // ignora
      }
      deferredPrompt = null;
      notify();
      return;
    }
    // iOS, ou Android sem o prompt pronto: mostra instruções.
    setShowHelp(true);
  }

  return (
    <div className={className}>
      {variant === "row" ? (
        <button
          type="button"
          onClick={handleClick}
          className="tap flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-left hover:bg-slate-50"
        >
          <Download className="h-5 w-5 text-brand" aria-hidden />
          <span className="flex-1 text-sm font-medium text-foreground">
            Instalar aplicativo
          </span>
          <ChevronRight className="h-4 w-4 text-muted" aria-hidden />
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={handleClick}
            className="tap inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-medium text-brand-foreground hover:bg-brand-hover"
          >
            <Download className="h-4 w-4" aria-hidden />
            Instalar aplicativo
          </button>

          <p className="mt-2 text-xs text-muted">
            Adiciona o ícone da Carvi na tela inicial do seu celular, abrindo em
            tela cheia como um aplicativo.
          </p>
        </>
      )}

      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                Adicionar à tela inicial
              </h3>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setShowHelp(false)}
                className="tap text-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {ios ? (
              <ol className="space-y-3 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
                    1
                  </span>
                  <span className="flex flex-wrap items-center gap-1">
                    Toque no botão{" "}
                    <Share className="inline h-4 w-4 text-brand" aria-hidden />
                    <strong>Compartilhar</strong> (na barra do Safari).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
                    2
                  </span>
                  <span className="flex flex-wrap items-center gap-1">
                    Escolha{" "}
                    <Plus className="inline h-4 w-4 text-brand" aria-hidden />
                    <strong>Adicionar à Tela de Início</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
                    3
                  </span>
                  <span>
                    Toque em <strong>Adicionar</strong>. Pronto! O ícone da Carvi
                    aparece na sua tela.
                  </span>
                </li>
              </ol>
            ) : (
              <ol className="space-y-3 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
                    1
                  </span>
                  <span>
                    Toque no menu do navegador (⋮, no canto superior direito).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
                    2
                  </span>
                  <span>
                    Escolha <strong>Instalar aplicativo</strong> ou{" "}
                    <strong>Adicionar à tela inicial</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
                    3
                  </span>
                  <span>
                    Confirme. O ícone da Carvi aparece na sua tela inicial.
                  </span>
                </li>
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
