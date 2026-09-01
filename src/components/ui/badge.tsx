import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/15 text-destructive border-destructive/20 font-medium",
        outline: "text-foreground border-border",
        success:
          "border-transparent bg-success/15 text-success border-success/20 font-medium",
        warning:
          "border-transparent bg-warning/15 text-warning-foreground border-warning/30 font-medium",
        info: "border-transparent bg-info/15 text-info border-info/20 font-medium",
        // Status específicos do Dona Vó
        pendente: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
        paga: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
        vencida: "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30",
        cancelada: "bg-stone-500/15 text-stone-700 dark:text-stone-400 border-stone-500/30",
        custeio: "bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30",
        investimento: "bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30",
        outras: "bg-stone-500/15 text-stone-800 dark:text-stone-300 border-stone-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
