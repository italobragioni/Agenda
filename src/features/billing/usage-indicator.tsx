import Link from "next/link";
import { Infinity as InfinityIcon, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDateBR } from "@/lib/datetime";
import type { Usage } from "./usage";

/**
 * Indicador de consumo de agendamentos do ciclo (painel do proprietário).
 * Para planos ilimitados mostra "ilimitado" sem barra. Perto do limite (>=80%)
 * ou no limite, mostra um aviso discreto com convite ao upgrade.
 */
export function UsageIndicator({ usage, tz }: { usage: Usage; tz: string }) {
  if (usage.unlimited) {
    return (
      <Card className="p-4">
        <p className="text-xs font-medium text-muted">Agendamentos do seu plano</p>
        <p className="mt-1 flex items-center gap-1.5 text-base font-semibold text-foreground">
          <InfinityIcon className="h-4 w-4 text-brand" aria-hidden />
          Agendamentos ilimitados
        </p>
      </Card>
    );
  }

  const limit = usage.limit ?? 0;
  const pct = limit > 0 ? Math.min(100, Math.round((usage.used / limit) * 100)) : 0;
  const barColor = usage.reachedLimit
    ? "bg-red-500"
    : usage.nearLimit
      ? "bg-amber-500"
      : "bg-brand";

  return (
    <Card className="p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-medium text-muted">
          Agendamentos do seu plano
        </p>
        {usage.renewsAt && (
          <p className="text-xs text-muted">
            Renova em {formatDateBR(usage.renewsAt.toISOString(), tz)}
          </p>
        )}
      </div>

      <p className="mt-1 text-base font-semibold text-foreground">
        {usage.used} de {limit} utilizados
      </p>

      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={usage.used}
        aria-valuemin={0}
        aria-valuemax={limit}
      >
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {(usage.nearLimit || usage.reachedLimit) && (
        <div className="mt-3 flex items-start justify-between gap-3 rounded-xl bg-brand-soft px-3 py-2">
          <p className="flex items-start gap-1.5 text-xs text-foreground">
            <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" aria-hidden />
            {usage.reachedLimit
              ? "Você atingiu o limite de agendamentos do seu plano neste ciclo."
              : "Você está próximo do limite de agendamentos do seu plano. Conheça as vantagens de fazer upgrade."}
          </p>
          <Link
            href="/assinatura"
            className="shrink-0 text-xs font-semibold text-brand hover:underline"
          >
            Ver planos
          </Link>
        </div>
      )}
    </Card>
  );
}
