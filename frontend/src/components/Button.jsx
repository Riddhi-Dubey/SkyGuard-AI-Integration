import { ArrowRight } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-sky-600 text-white hover:bg-sky-700 shadow-sm border border-sky-600/30",
  secondary:
    "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm",
  ghost: "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100",
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
