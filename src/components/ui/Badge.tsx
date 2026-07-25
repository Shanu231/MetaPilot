import React from "react";
import { cn } from "../../utils/cn";

export type BadgeVariant = "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "outline";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "primary", children, ...props }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border tracking-wide transition-colors duration-150";

  const variants = {
    primary:
      "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
    secondary:
      "bg-brand-accent/10 text-brand-accent border-brand-accent/20",
    success:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning:
      "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger:
      "bg-rose-500/10 text-rose-400 border-rose-500/20",
    info:
      "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    outline:
      "bg-transparent text-brand-muted border-white/10 hover:border-white/20",
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
