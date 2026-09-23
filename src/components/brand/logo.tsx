import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo da Carvi (PNG transparente). Como o texto "Car" é claro, use sobre
 * um fundo escuro para garantir o contraste.
 */
export function CarviLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Carvi"
      width={1254}
      height={1254}
      priority
      className={cn("w-auto", className)}
    />
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
