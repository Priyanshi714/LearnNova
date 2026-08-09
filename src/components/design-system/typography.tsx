import * as React from "react";
import { cn } from "@/lib/utils";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function PageTitle({ className, children, ...props }: TypographyProps) {
  return (
    <h1
      className={cn(
        "text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl",
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

export function SectionTitle({ className, children, ...props }: TypographyProps) {
  return (
    <h2
      className={cn("text-xl font-semibold tracking-tight text-foreground md:text-2xl", className)}
      {...props}
    >
      {children}
    </h2>
  );
}

export function CardTitle({ className, children, ...props }: TypographyProps) {
  return (
    <h3
      className={cn("text-base font-semibold tracking-tight text-foreground md:text-lg", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function Subtitle({ className, children, ...props }: TypographyProps) {
  return (
    <p
      className={cn("text-base text-muted-foreground md:text-lg leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function Caption({ className, children, ...props }: TypographyProps) {
  return (
    <span
      className={cn("text-xs text-muted-foreground tracking-wide font-normal", className)}
      {...props}
    >
      {children}
    </span>
  );
}

export function MutedText({ className, children, ...props }: TypographyProps) {
  return (
    <p className={cn("text-sm text-muted-foreground leading-normal", className)} {...props}>
      {children}
    </p>
  );
}

export function Label({ className, children, ...props }: TypographyProps) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none text-foreground select-none disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
}

export function CodeText({ className, children, ...props }: TypographyProps) {
  return (
    <code
      className={cn(
        "relative rounded bg-muted/40 px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold border border-border/40 text-primary-glow",
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
}
