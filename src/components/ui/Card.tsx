import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../utils/cn";

export interface CardProps extends HTMLMotionProps<"div"> {
  hoverable?: boolean;
  glow?: boolean;
  borderGradient?: boolean;
  glass?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = true, glow = false, borderGradient = false, glass = true, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hoverable ? { y: -4, transition: { duration: 0.2 } } : undefined}
        className={cn(
          "rounded-2xl relative overflow-hidden transition-all duration-300",
          glass ? "glass" : "bg-brand-card",
          borderGradient ? "border border-transparent bg-clip-padding" : "border border-white/5",
          glow && "shadow-glow-primary",
          className
        )}
        {...props}
      >
        {/* Glowing aura for border gradient */}
        {borderGradient && (
          <div className="absolute inset-0 -z-10 p-[1px] rounded-2xl bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent mask-composite" />
        )}
        <div className="p-6 relative z-10">{children as React.ReactNode}</div>
      </motion.div>
    );
  }
);

Card.displayName = "Card";
