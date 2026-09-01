import { ArrowRight } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-atmos-400 text-base-950 hover:bg-atmos-300 shadow-[0_0_0_1px_rgba(95,211,240,0.4)]",
  secondary:
    "bg-transparent text-ink border border-line-strong hover:border-atmos-400/60 hover:text-white",
  ghost: "bg-transparent text-ink-dim hover:text-ink",
};

export default function Button({
  children,
  variant = "primary",
  icon = false,
  className = "",
  as: Component = "button",
  ...props
}) {
  return (
    <Component
      className={`group inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium tracking-tight transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atmos-400 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
      {icon && (
        <ArrowRight
          size={16}
          strokeWidth={2}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      )}
    </Component>
  );
}
