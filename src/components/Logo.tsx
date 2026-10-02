interface LogoProps {
  /** onLight: brand-900 on a light surface. onDark: white on brand green. */
  tone?: "onLight" | "onDark";
  className?: string;
}

export function Logo({ tone = "onLight", className = "" }: LogoProps) {
  return (
    <span
      className={`font-heading text-xl font-extrabold tracking-tight ${
        tone === "onDark" ? "text-white" : "text-brand-900"
      } ${className}`}
    >
      KORRIGO
    </span>
  );
}
