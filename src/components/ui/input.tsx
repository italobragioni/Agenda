import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-card px-3 text-foreground placeholder:text-muted focus:border-brand focus:outline-2 focus:outline-offset-0 focus:outline-brand",
        className,
      )}
      {...props}
    />
  );
}
