import * as React from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { CardTitle, Subtitle, Caption } from "./typography";

export interface GlassCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  hoverEffect?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    { className, title, subtitle, icon, header, footer, hoverEffect = false, children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-xl border border-white/5 bg-gradient-to-br from-[#121026]/30 via-[#07060f]/50 to-[#0e0c1b]/30 backdrop-blur-md shadow-lg shadow-black/20 transition-all duration-300 overflow-hidden group/card",
          hoverEffect &&
            "hover:border-primary/30 hover:bg-gradient-to-br hover:from-[#181534]/40 hover:to-[#0b0a18]/40 hover:shadow-[0_0_25px_-5px_var(--primary-glow)] hover:scale-[1.02] active:scale-[0.98]",
          className,
        )}
        {...props}
      >
        {/* Soft inner glow on hover */}
        {hoverEffect && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none" />
        )}
        {(title || subtitle || icon || header) && (
          <div className="flex items-start justify-between p-5 border-b border-border/20">
            {header ? (
              header
            ) : (
              <div className="flex items-center gap-3">
                {icon && <div className="text-primary-glow mt-0.5 shrink-0">{icon}</div>}
                <div className="space-y-0.5">
                  {title && typeof title === "string" ? <CardTitle>{title}</CardTitle> : title}
                  {subtitle && typeof subtitle === "string" ? (
                    <Caption className="block">{subtitle}</Caption>
                  ) : (
                    subtitle
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="p-5">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-border/20 bg-muted/20">{footer}</div>}
      </div>
    );
  },
);
GlassCard.displayName = "GlassCard";

interface StatCardProps extends Omit<GlassCardProps, "title" | "subtitle"> {
  label: string;
  value: React.ReactNode;
  trend?: React.ReactNode;
}

export function StatCard({ label, value, trend, className, ...props }: StatCardProps) {
  return (
    <GlassCard
      hoverEffect
      className={cn("relative overflow-hidden border-white/5", className)}
      {...props}
    >
      <div className="space-y-2">
        <Caption className="text-muted-foreground font-medium uppercase tracking-wider text-[10px] block">
          {label}
        </Caption>
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {value}
          </span>
          {trend && <div className="text-xs font-semibold shrink-0">{trend}</div>}
        </div>
      </div>
    </GlassCard>
  );
}

interface MetricCardProps extends GlassCardProps {
  label: string;
  value: React.ReactNode;
  subValue?: React.ReactNode;
}

export function MetricCard({ label, value, subValue, className, ...props }: MetricCardProps) {
  return (
    <GlassCard className={cn("p-4", className)} {...props}>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-xl font-bold text-foreground">{value}</span>
          {subValue && <span className="text-xs text-muted-foreground">{subValue}</span>}
        </div>
      </div>
    </GlassCard>
  );
}

interface ProgressCardProps extends Omit<GlassCardProps, "title" | "subtitle"> {
  title: string;
  description?: string;
  value: number; // 0 to 100
  totalLabel?: string;
  solvedCount?: number;
  totalCount?: number;
}

export function ProgressCard({
  title,
  description,
  value,
  totalLabel = "Solved",
  solvedCount,
  totalCount,
  className,
  ...props
}: ProgressCardProps) {
  return (
    <GlassCard title={title} subtitle={description} className={cn("w-full", className)} {...props}>
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-muted-foreground">{totalLabel}</span>
          <span className="text-foreground">
            {solvedCount !== undefined && totalCount !== undefined
              ? `${solvedCount}/${totalCount} (${Math.round(value)}%)`
              : `${Math.round(value)}%`}
          </span>
        </div>
        <Progress value={value} className="h-2 bg-muted/40" />
      </div>
    </GlassCard>
  );
}

export interface ActionCardProps extends GlassCardProps {
  to?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export function ActionCard({ className, hoverEffect = true, onClick, ...props }: ActionCardProps) {
  return (
    <GlassCard
      hoverEffect={hoverEffect}
      onClick={onClick}
      className={cn(
        onClick || props.to ? "cursor-pointer" : "",
        "glass-card-interactive",
        className,
      )}
      {...props}
    />
  );
}
