"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { parseCurrencyInput, formatNumberBRL } from "@/lib/formatters";

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: number | string;
  onChange?: (value: number) => void;
  onValueChange?: (value: number, rawString: string) => void;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, onValueChange, onBlur, ...props }, ref) => {
    // Valor exibido no input em formato textual (ex: "12,50")
    const [displayValue, setDisplayValue] = React.useState<string>(() => {
      if (value === undefined || value === null || value === "") return "";
      const num = typeof value === "string" ? parseCurrencyInput(value) : value;
      return num ? formatNumberBRL(num) : "";
    });

    // Sincroniza quando o valor externo muda (ex: reset do formulário ou carregamento inicial)
    React.useEffect(() => {
      if (value === undefined || value === null || value === "") {
        setDisplayValue("");
        return;
      }
      const num = typeof value === "string" ? parseCurrencyInput(value) : value;
      // Não sobrescreve se o usuário estiver no meio da digitação do mesmo valor numérico
      const currentParsed = parseCurrencyInput(displayValue);
      if (currentParsed !== num) {
        setDisplayValue(num ? formatNumberBRL(num) : "");
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let raw = e.target.value;

      // Substitui ponto por vírgula para manter o padrão brasileiro
      raw = raw.replace(/\./g, ",");

      // Permite apenas números e vírgula
      raw = raw.replace(/[^\d,]/g, "");

      // Garante no máximo uma vírgula
      const parts = raw.split(",");
      if (parts.length > 2) {
        raw = parts[0] + "," + parts.slice(1).join("");
      }

      // Limita a 2 casas decimais após a vírgula
      if (parts.length === 2 && parts[1].length > 2) {
        raw = parts[0] + "," + parts[1].slice(0, 2);
      }

      setDisplayValue(raw);

      const numeric = parseCurrencyInput(raw);
      if (onChange) {
        onChange(numeric);
      }
      if (onValueChange) {
        onValueChange(numeric, raw);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (displayValue.trim() !== "") {
        const numeric = parseCurrencyInput(displayValue);
        if (numeric > 0) {
          setDisplayValue(formatNumberBRL(numeric));
        } else {
          setDisplayValue("");
        }
      }
      if (onBlur) {
        onBlur(e);
      }
    };

    return (
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        className={cn(
          "flex h-11 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]",
          className
        )}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
