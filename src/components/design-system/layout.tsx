import * as React from "react";
import { cn } from "@/lib/utils";
import { PageTitle, SectionTitle, Subtitle } from "./typography";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageContainer({ className, children, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "container mx-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 max-w-7xl space-y-6 md:space-y-8 animate-in fade-in duration-200",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-border/40 pb-6 md:flex-row md:items-center md:justify-between md:gap-8",
        className,
      )}
      {...props}
    >
      <div className="space-y-1.5 flex-1">
        {breadcrumbs && <div className="mb-2">{breadcrumbs}</div>}
        <PageTitle className="tracking-tight">{title}</PageTitle>
        {subtitle && <Subtitle className="text-sm md:text-base mt-1">{subtitle}</Subtitle>}
      </div>
      {actions && (
        <div className="flex items-center gap-3 self-start md:self-center shrink-0">{actions}</div>
      )}
    </div>
  );
}

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function SectionHeader({
  title,
  subtitle,
  actions,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 pb-4 border-b border-border/20 sm:flex-row sm:items-center sm:justify-between sm:gap-6",
        className,
      )}
      {...props}
    >
      <div className="space-y-0.5">
        <SectionTitle className="text-lg md:text-xl font-semibold">{title}</SectionTitle>
        {subtitle && <p className="text-xs md:text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">{actions}</div>
      )}
    </div>
  );
}

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export function Divider({ orientation = "horizontal", className, ...props }: DividerProps) {
  return (
    <div
      className={cn(
        "bg-border/40 shrink-0",
        orientation === "horizontal" ? "h-[1px] w-full my-4" : "w-[1px] h-full mx-4",
        className,
      )}
      {...props}
    />
  );
}
