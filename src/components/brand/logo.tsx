import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo da Carvi. A arte tem fundo branco e texto escuro, ideal para
 * superfícies claras (que é o padrão do app).
 */
export function CarviLogo({
  className,
  transparent = false,
}: {
  className?: string;
  transparent?: boolean;
}) {
  return (
    <Image
      src={transparent ? "/logo-transparent.png" : "/logo.jpg"}
      alt="Carvi"
      width={1774}
      height={887}
      priority
      className={cn("w-auto", className)}
    />
  );
}

/**
 * Logo do estabelecimento (se enviada) ou a marca Carvi como padrão.
 * Usada no painel para dar a "cara" do negócio.
 */
export function EstablishmentLogo({
  logoUrl,
  className,
}: {
  logoUrl?: string | null;
  className?: string;
}) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt="Logo"
        width={240}
        height={140}
        unoptimized
        className={cn("w-auto object-contain", className)}
      />
    );
  }
  return <CarviLogo className={className} />;
}

/**
 * Marca em texto "Carvi" (fallback para casos muito compactos).
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
