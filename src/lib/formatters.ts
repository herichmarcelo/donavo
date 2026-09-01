import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Formata um valor numérico ou string como moeda brasileira (BRL)
 * Ex: 1250.5 -> R$ 1.250,50
 */
export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "R$ 0,00";
  const num = typeof value === "string" ? parseFloat(value.replace(",", ".")) : Number(value);
  if (isNaN(num)) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

/**
 * Formata um valor simples sem o prefixo R$
 * Ex: 1250.5 -> 1.250,50
 */
export function formatNumberBRL(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "0,00";
  const num = typeof value === "string" ? parseFloat(value.replace(",", ".")) : Number(value);
  if (isNaN(num)) return "0,00";

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Formata uma data para o padrão brasileiro DD/MM/YYYY
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(d)) {
      const fallback = new Date(date);
      if (isValid(fallback)) return format(fallback, "dd/MM/yyyy", { locale: ptBR });
      return "-";
    }
    return format(d, "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "-";
  }
}

/**
 * Formata data e hora para DD/MM/YYYY às HH:mm
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(d)) return "-";
    return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return "-";
  }
}

/**
 * Formata para input type="date" (YYYY-MM-DD)
 */
export function formatDateInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(d)) return "";
    return format(d, "yyyy-MM-dd");
  } catch {
    return "";
  }
}

/**
 * Formata para Mês e Ano por extenso (ex: "Julho de 2026")
 */
export function formatMonthYear(date: Date | string | null | undefined): string {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(d)) return "";
    const str = format(d, "MMMM 'de' yyyy", { locale: ptBR });
    return str.charAt(0).toUpperCase() + str.slice(1);
  } catch {
    return "";
  }
}

/**
 * Converte string formatada ou input numérico em float seguro
 */
export function parseCurrencyInput(value: string | number): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  // Remove "R$", espaços e troca ponto por nada e vírgula por ponto
  const clean = value
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}
