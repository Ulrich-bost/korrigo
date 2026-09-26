import Image from "next/image";

interface LogoProps {
  /** "full" = mark + wordmark + slogan (navbar, footer, marketing) */
  /** "icon" = mark only (compact spaces, favicons-like usage) */
  variant?: "full" | "icon";
  height?: number;
  className?: string;
  priority?: boolean;
}

export function Logo({ variant = "full", height = 40, className = "", priority = false }: LogoProps) {
  const isFull = variant === "full";
  // logo-full.png is 766x258, logo-icon.png is 214x246
  const ratio = isFull ? 766 / 258 : 214 / 246;
  const width = Math.round(height * ratio);

  return (
    <Image
      src={isFull ? "/logo-full.png" : "/logo-icon.png"}
      alt="KORRIGO — Révise intelligemment. Réussis facilement."
      height={height}
      width={width}
      priority={priority}
      className={`object-contain ${className}`}
    />
  );
}
