import Link from "next/link";
import { CalendarCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2 text-foreground"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-foreground">
            <CalendarCheck className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-lg font-semibold tracking-tight">Agenda</span>
        </Link>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {children}
        </div>
      </div>
    </main>
  );
}
