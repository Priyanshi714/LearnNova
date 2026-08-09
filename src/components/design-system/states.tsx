import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { CardTitle, MutedText } from "./typography";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionButton?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  actionButton,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-xl border border-dashed border-border bg-card/15 backdrop-blur-sm max-w-lg mx-auto space-y-4 my-6",
        className,
      )}
      {...props}
    >
      {icon && (
        <div className="flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary-glow border border-primary/20 animate-pulse-subtle">
          {icon}
        </div>
      )}
      <div className="space-y-1.5">
        <CardTitle className="text-lg">{title}</CardTitle>
        <MutedText className="text-sm max-w-sm mx-auto">{description}</MutedText>
      </div>
      {actionButton && <div className="pt-2">{actionButton}</div>}
    </div>
  );
}

// 1. Card Skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-5 border border-border/40 bg-card/45 rounded-xl space-y-4", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  );
}

// 2. List Skeleton
export function ListSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 border border-border/20 bg-card/20 rounded-lg"
        >
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="size-5 rounded" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// 3. Table Skeleton
export function TableSkeleton({
  rows = 4,
  cols = 3,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full border border-border/20 rounded-xl overflow-hidden bg-card/25",
        className,
      )}
    >
      <div className="grid grid-cols-3 bg-muted/40 p-4 border-b border-border/20">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-1/2" />
        ))}
      </div>
      <div className="divide-y divide-border/20">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="grid grid-cols-3 p-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 w-3/4" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. Stat Skeleton
export function StatSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-5 border border-border/40 bg-card/45 rounded-xl space-y-2", className)}>
      <Skeleton className="h-3 w-16" />
      <div className="flex items-baseline justify-between">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

// 5. Page Skeleton
export function PageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-8 animate-pulse", className)}>
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 pb-6 border-b border-border/20 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-10 w-28 rounded-lg self-start sm:self-center" />
      </div>
      {/* Grid of Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>
      {/* Content Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <CardSkeleton className="h-64" />
          <CardSkeleton />
        </div>
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

// 6. Markdown Skeleton
export function MarkdownSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3 p-4", className)}>
      <Skeleton className="h-6 w-1/3 mb-4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-11/12" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-6 w-1/4 my-4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

// 7. Code Skeleton
export function CodeSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "p-4 font-mono bg-muted/30 border border-border/40 rounded-lg space-y-2",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-border/20 pb-2 mb-3">
        <div className="size-2.5 rounded-full bg-red-500/40" />
        <div className="size-2.5 rounded-full bg-yellow-500/40" />
        <div className="size-2.5 rounded-full bg-green-500/40" />
      </div>
      <Skeleton className="h-4 w-1/4 bg-primary/5" />
      <Skeleton className="h-4 w-2/3 ml-4 bg-primary/5" />
      <Skeleton className="h-4 w-1/2 ml-8 bg-primary/5" />
      <Skeleton className="h-4 w-3/4 ml-12 bg-primary/5" />
      <Skeleton className="h-4 w-1/3 ml-8 bg-primary/5" />
      <Skeleton className="h-4 w-1/4 ml-4 bg-primary/5" />
      <Skeleton className="h-4 w-1/5 bg-primary/5" />
    </div>
  );
}
