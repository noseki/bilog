import * as React from "react";
import { cn } from "@/lib/utils";

export const Empty = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col items-center justify-center gap-4 py-12 text-center", className)} {...props}>
    {children}
  </div>
);

export const EmptyHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col items-center gap-2", className)} {...props}>
    {children}
  </div>
);

interface EmptyMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "icon";
}

export const EmptyMedia = ({ className, variant = "default", children, ...props }: EmptyMediaProps) => (
  <div
    className={cn(
      variant === "icon" && "flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const EmptyTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-base font-semibold text-foreground", className)} {...props}>
    {children}
  </h3>
);

export const EmptyDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props}>
    {children}
  </p>
);

export const EmptyContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col items-center gap-2", className)} {...props}>
    {children}
  </div>
);
