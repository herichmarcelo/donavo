import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";

interface KPICardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "danger" | "warning" | "info";
  className?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  className,
}: KPICardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          iconBg: "bg-destructive/15 text-destructive",
          valueColor: "text-destructive",
          border: "border-destructive/20 hover:border-destructive/40",
          cardBg: "bg-gradient-to-br from-card to-destructive/5",
        };
      case "success":
        return {
          iconBg: "bg-success/15 text-success",
          valueColor: "text-success",
          border: "border-success/20 hover:border-success/40",
          cardBg: "bg-gradient-to-br from-card to-success/5",
        };
      case "warning":
        return {
          iconBg: "bg-secondary/20 text-secondary-foreground",
          valueColor: "text-secondary-foreground dark:text-secondary-light",
          border: "border-secondary/30 hover:border-secondary/50",
          cardBg: "bg-gradient-to-br from-card to-secondary/5",
        };
      case "info":
        return {
          iconBg: "bg-info/15 text-info",
          valueColor: "text-info",
          border: "border-info/20 hover:border-info/40",
          cardBg: "bg-gradient-to-br from-card to-info/5",
        };
      default:
        return {
          iconBg: "bg-primary/15 text-primary",
          valueColor: "text-foreground",
          border: "border-border hover:border-primary/40",
          cardBg: "bg-card",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={cn(
        "rounded-2xl p-5 border shadow-sm transition-all duration-200 hover:shadow-md relative overflow-hidden group",
        styles.cardBg,
        styles.border,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className={cn("text-2xl md:text-3xl font-bold tracking-tight", styles.valueColor)}>
            {formatCurrency(value)}
          </p>
        </div>
        <div
          className={cn(
            "p-3 rounded-xl transition-transform duration-200 group-hover:scale-110 shrink-0",
            styles.iconBg
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {subtitle && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}
