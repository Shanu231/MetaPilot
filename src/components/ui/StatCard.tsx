import React from "react";
import { Card } from "./Card";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { cn } from "../../utils/cn";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  subtitle?: string;
  className?: string;
}

export function StatCard({ title, value, icon, trend, subtitle, className }: StatCardProps) {
  return (
    <Card className={cn("hoverable transition-all relative overflow-hidden", className)}>
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider font-heading">
            {title}
          </span>
          <h3 className="text-3xl font-bold font-heading text-white tracking-tight mt-1">
            {value}
          </h3>
        </div>
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-brand-secondary">
          {icon}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        {trend && (
          <div
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full border",
              trend.direction === "up" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
              trend.direction === "down" && "bg-rose-500/10 text-rose-400 border-rose-500/20",
              trend.direction === "neutral" && "bg-white/5 text-brand-muted border-white/10"
            )}
          >
            {trend.direction === "up" && <ArrowUpRight className="h-3 w-3" />}
            {trend.direction === "down" && <ArrowDownRight className="h-3 w-3" />}
            {trend.direction === "neutral" && <TrendingUp className="h-3 w-3" />}
            {trend.value}
          </div>
        )}
        {subtitle && (
          <span className="text-xs text-brand-muted font-medium">
            {subtitle}
          </span>
        )}
      </div>
    </Card>
  );
}
