import { cn } from "@/lib/utils";
import type { TextareaHTMLAttributes } from "react";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-foreground placeholder:text-muted focus:border-brand focus:outline-2 focus:outline-offset-0 focus:outline-brand",
        className,
      )}
      {...props}
    />
  );
}
