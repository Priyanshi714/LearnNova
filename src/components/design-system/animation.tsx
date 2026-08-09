import * as React from "react";
import { cn } from "@/lib/utils";

interface MotionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number; // delay in ms
}

export function FadeIn({ className, children, delay = 0, style, ...props }: MotionProps) {
  return (
    <div
      className={cn("animate-ds-fade-in opacity-0", className)}
      style={{
        animationDelay: `${delay}ms`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function SlideUp({ className, children, delay = 0, style, ...props }: MotionProps) {
  return (
    <div
      className={cn("animate-ds-slide-up opacity-0", className)}
      style={{
        animationDelay: `${delay}ms`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function ScaleOnHover({ className, children, ...props }: Omit<MotionProps, "delay">) {
  return (
    <div
      className={cn(
        "transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHover({ className, children, ...props }: Omit<MotionProps, "delay">) {
  return (
    <div
      className={cn(
        "transition-all duration-300 ease-out hover:scale-[1.01] hover:border-primary/25 hover:bg-card/65 hover:shadow-ds-glow active:scale-[0.99]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AccordionMotion({ className, children, ...props }: Omit<MotionProps, "delay">) {
  return (
    <div
      className={cn(
        "grid transition-all duration-300 ease-out grid-rows-[0fr] data-[state=open]:grid-rows-[1fr] overflow-hidden",
        className,
      )}
      {...props}
    >
      <div className="min-h-0">{children}</div>
    </div>
  );
}

export function ModalMotion({ className, children, ...props }: Omit<MotionProps, "delay">) {
  return (
    <div
      className={cn("animate-ds-scale-up duration-200 transition-all ease-out", className)}
      {...props}
    >
      {children}
    </div>
  );
}
