import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "info";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-primary/15 text-primary border-primary/30",
    secondary: "bg-secondary text-secondary-foreground border-border/40",
    outline: "bg-transparent text-foreground border-border/80",
    destructive: "bg-destructive/15 text-destructive border-destructive/30",
    success: "bg-success/15 text-success border-success/30",
    warning: "bg-warning/15 text-warning border-warning/30",
    info: "bg-primary-glow/15 text-primary-glow border-primary-glow/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

interface InfoChipProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

export function InfoChip({ label, value, icon, className, ...props }: InfoChipProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border/30 bg-card/60 px-2 py-1 text-xs font-medium text-foreground shadow-sm",
        className,
      )}
      {...props}
    >
      {icon && <span className="text-muted-foreground shrink-0 [&_svg]:size-3">{icon}</span>}
      <span className="text-muted-foreground font-normal">{label}:</span>
      <span className="text-foreground font-semibold">{value}</span>
    </div>
  );
}

export type StatusType = "Solved" | "Attempted" | "Pending" | string;

interface StatusChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
}

export function StatusChip({ status, className, ...props }: StatusChipProps) {
  const map: Record<string, string> = {
    solved: "bg-success/15 text-success border-success/30",
    attempted: "bg-warning/15 text-warning border-warning/30",
    pending: "bg-muted/15 text-muted-foreground border-muted/30",
  };

  const normalized = status.toLowerCase();
  const style = map[normalized] || "bg-secondary text-secondary-foreground border-border/40";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors select-none",
        style,
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "size-1.5 rounded-full shrink-0",
          normalized === "solved"
            ? "bg-success"
            : normalized === "attempted"
              ? "bg-warning"
              : "bg-muted-foreground",
        )}
      />
      {status}
    </span>
  );
}

export function GradientBadge({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-primary/30 px-2.5 py-0.5 text-xs font-semibold text-foreground bg-gradient-to-r from-primary/20 via-primary-glow/10 to-accent/20 shadow-sm animate-pulse-subtle",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export type DifficultyType = "Easy" | "Medium" | "Hard" | string;

interface DifficultyBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  difficulty: DifficultyType;
}

export function DifficultyBadge({ difficulty, className, ...props }: DifficultyBadgeProps) {
  const map: Record<string, string> = {
    easy: "bg-success/15 text-success border-success/30",
    medium: "bg-warning/15 text-warning border-warning/30",
    hard: "bg-destructive/15 text-destructive border-destructive/30",
  };

  const normalized = difficulty.toLowerCase();
  const style = map[normalized] || "bg-secondary text-secondary-foreground border-border/40";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase transition-colors select-none",
        style,
        className,
      )}
      {...props}
    >
      {difficulty}
    </span>
  );
}

export type MasteryType = "Beginner" | "Learning" | "Intermediate" | "Advanced" | "Master" | string;

interface MasteryBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  level: MasteryType;
}

export function MasteryBadge({ level, className, ...props }: MasteryBadgeProps) {
  const map: Record<string, string> = {
    beginner: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    learning: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    intermediate: "bg-warning/15 text-warning border-warning/30",
    advanced: "bg-primary-glow/15 text-primary-glow border-primary-glow/30",
    master:
      "bg-gradient-to-r from-primary/20 to-primary-glow/20 text-foreground border-primary/40 shadow-sm",
  };

  const normalized = level.toLowerCase();
  const style = map[normalized] || "bg-secondary text-secondary-foreground border-border/40";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium select-none",
        style,
        className,
      )}
      {...props}
    >
      {level}
    </span>
  );
}

export type PriorityType = "Low" | "Medium" | "High" | "Critical" | string;

interface PriorityBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  priority: PriorityType;
}

export function PriorityBadge({ priority, className, ...props }: PriorityBadgeProps) {
  const map: Record<string, string> = {
    low: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    medium: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    high: "bg-warning/15 text-warning border-warning/30",
    critical: "bg-destructive/15 text-destructive border-destructive/30 animate-pulse",
  };

  const normalized = priority.toLowerCase();
  const style = map[normalized] || "bg-secondary text-secondary-foreground border-border/40";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase select-none",
        style,
        className,
      )}
      {...props}
    >
      {priority}
    </span>
  );
}
