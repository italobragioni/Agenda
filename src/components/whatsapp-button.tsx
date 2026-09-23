import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/phone";
import { cn } from "@/lib/utils";

/** Link para abrir o WhatsApp com o cliente (wa.me). */
export function WhatsAppButton({
  phone,
  message,
  className,
  label = "WhatsApp",
}: {
  phone: string;
  message?: string;
  className?: string;
  label?: string;
}) {
  return (
    <a
      href={whatsappLink(phone, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 text-sm font-medium text-white transition-colors hover:bg-green-700",
        "h-11",
        className,
      )}
    >
      <MessageCircle className="h-4 w-4" aria-hidden />
      {label}
    </a>
  );
}
