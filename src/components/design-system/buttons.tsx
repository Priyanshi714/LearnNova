import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const dsButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] shadow-sm select-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-ds-glow hover:shadow-ds-glow-strong border border-primary/20",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/40",
        outline:
          "border border-border/80 bg-transparent text-foreground hover:bg-accent/40 hover:text-accent-foreground",
        ghost:
          "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent/30 shadow-none hover:scale-100",
        danger:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_0_15px_rgba(239,68,68,0.15)]",
        success:
          "bg-success text-primary-foreground hover:bg-success/90 shadow-[0_0_15px_rgba(34,197,94,0.15)]",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md [&_svg]:size-3.5",
        md: "h-10 px-4 py-2",
        lg: "h-11 px-6 py-3 text-base rounded-xl [&_svg]:size-5",
        icon: "h-9 w-9 p-0 rounded-md hover:scale-105 active:scale-95",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof dsButtonVariants> {
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      iconLeft,
      iconRight,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(dsButtonVariants({ variant, size, className }))}
        {...props}
      >
        {loading && <Loader2 className="animate-spin mr-1 size-4 shrink-0" />}
        {!loading && iconLeft && <span className="flex shrink-0">{iconLeft}</span>}
        {children}
        {!loading && iconRight && <span className="flex shrink-0">{iconRight}</span>}
      </button>
    );
  },
);

Button.displayName = "DSButton";

export interface LoadingButtonProps extends ButtonProps {
  loadingText?: string;
}

export function LoadingButton({
  loadingText = "Loading...",
  children,
  loading = true,
  ...props
}: LoadingButtonProps) {
  return (
    <Button loading={loading} {...props}>
      {loading ? loadingText : children}
    </Button>
  );
}

export interface IconButtonProps extends Omit<ButtonProps, "iconLeft" | "iconRight"> {
  children: React.ReactNode;
}

export function IconButton({ children, className, ...props }: IconButtonProps) {
  return (
    <Button
      size="icon"
      variant="outline"
      className={cn("hover:bg-accent/40", className)}
      {...props}
    >
      {children}
    </Button>
  );
}
