import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../utils/cn";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "glow";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "type"> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  type?: "button" | "submit" | "reset";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, type = "button", children, ...props }, ref) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-heading font-medium tracking-wide rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-primary disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-gradient-to-r from-brand-primary to-brand-accent text-white hover:brightness-110 shadow-lg hover:shadow-brand-primary/20",
      secondary:
        "glass text-white hover:bg-white/10 hover:border-white/20 border-white/5 shadow-glass",
      outline:
        "border border-white/10 text-white bg-transparent hover:bg-white/5 hover:border-white/25",
      ghost:
        "text-brand-muted hover:text-white hover:bg-white/5 bg-transparent",
      danger:
        "bg-gradient-to-r from-rose-600 to-red-700 text-white hover:brightness-110 shadow-lg hover:shadow-rose-600/20",
      glow:
        "bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent text-white shadow-glow-primary border border-white/10 hover:brightness-110",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
      md: "px-5 py-2.5 text-sm gap-2",
      lg: "px-7 py-3.5 text-base gap-2.5",
      icon: "p-2.5 rounded-lg",
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {size !== "icon" && <span>Loading...</span>}
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
