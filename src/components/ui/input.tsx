import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-xl border border-border bg-slate-50 px-3.5 text-[15px] text-foreground placeholder:text-muted focus:border-brand focus:bg-card focus:outline-2 focus:outline-offset-0 focus:outline-brand",
        className,
      )}
      {...props}
    />
  );
}
