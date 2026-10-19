import { cn } from "@/lib/utils";
import type { TextareaHTMLAttributes } from "react";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-border bg-slate-50 px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-muted focus:border-brand focus:bg-card focus:outline-2 focus:outline-offset-0 focus:outline-brand",
        className,
      )}
      {...props}
    />
  );
}
