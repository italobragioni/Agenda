import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo da Carvi (imagem). A arte tem texto claro e fundo transparente,
 * então fica sobre um fundo escuro para garantir contraste.
 */
export function CarviLogo({
  className,
  imgClassName = "h-16",
}: {
  className?: string;
  imgClassName?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-2xl bg-slate-950 p-3",
        className,
      )}
    >
      <Image
        src="/logo.png"
        alt="Carvi"
        width={1254}
        height={1254}
        priority
        className={cn("w-auto", imgClassName)}
      />
    </span>
  );
}

/**
 * Marca em texto "Carvi" (para cabeçalhos/menus compactos).
 * "Car" na cor do texto e "vi" no azul da marca, como no logotipo.
 */
export function CarviWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-bold tracking-tight", className)}>
      <span className="text-foreground">Car</span>
      <span className="text-brand">vi</span>
    </span>
  );
}
