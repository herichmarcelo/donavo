"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { formatDate, parseDateToISOString } from "@/lib/formatters";

export interface DateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: string;
  onChange?: (value: string) => void;
}

/**
 * Aplica máscara DD/MM/AAAA a uma sequência de números
 */
export function maskDateBR(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, value, onChange, onBlur, disabled, ...props }, ref) => {
    // Hidden native date picker ref
    const hiddenDateInputRef = React.useRef<HTMLInputElement>(null);

    const [displayValue, setDisplayValue] = React.useState<string>(() => {
      if (!value) return "";
      return formatDate(value);
    });

    React.useEffect(() => {
      if (!value) {
        setDisplayValue("");
        return;
      }
      const formatted = formatDate(value);
      if (formatted !== "-" && formatted !== displayValue) {
        setDisplayValue(formatted);
      }
    }, [value]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const masked = maskDateBR(raw);
      setDisplayValue(masked);

      if (onChange) {
        onChange(masked);
      }
    };

    const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const isoDate = e.target.value; // YYYY-MM-DD
      if (isoDate) {
        const brFormatted = formatDate(isoDate);
        setDisplayValue(brFormatted);
        if (onChange) {
          onChange(brFormatted);
        }
      }
    };

    const openPicker = () => {
      if (disabled) return;
      const el = hiddenDateInputRef.current;
      if (!el) return;
      try {
        if (typeof (el as any).showPicker === "function") {
          (el as any).showPicker();
        } else {
          el.focus();
          el.click();
        }
      } catch {
        el.focus();
        el.click();
      }
    };

    return (
      <div className="relative flex items-center">
        <input
          type="text"
          inputMode="numeric"
          placeholder="DD/MM/AAAA"
          maxLength={10}
          autoComplete="off"
          disabled={disabled}
          className={cn(
            "flex h-11 w-full rounded-lg border border-input bg-background pl-10 pr-10 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]",
            className
          )}
          ref={ref}
          value={displayValue}
          onChange={handleTextChange}
          onBlur={onBlur}
          {...props}
        />

        {/* Botão de calendário para abrir seletor visual */}
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={openPicker}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
          title="Abrir calendário"
        >
          <Calendar className="h-4 w-4" />
        </button>

        {/* Input date nativo oculto para suportar o picker nativo do sistema */}
        <input
          type="date"
          tabIndex={-1}
          ref={hiddenDateInputRef}
          value={parseDateToISOString(displayValue)}
          onChange={handleNativePickerChange}
          className="sr-only absolute pointer-events-none opacity-0"
          aria-hidden="true"
        />
      </div>
    );
  }
);

DateInput.displayName = "DateInput";
