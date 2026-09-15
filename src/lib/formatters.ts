import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Converte string formatada ou input numérico em float seguro
 * Suporta:
 * - 12.50 ou 12,50 -> 12.5
 * - 1250 -> 1250
 * - 1.250,50 -> 1250.5
 * - 1,250.50 -> 1250.5
 * - R$ 12,50 -> 12.5
 */
export function parseCurrencyInput(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return isNaN(value) ? 0 : value;

  let str = String(value).trim().replace(/[R$\s]/g, "");
  if (!str) return 0;

  const hasComma = str.includes(",");
  const hasDot = str.includes(".");

  if (hasComma && hasDot) {
    if (str.lastIndexOf(",") > str.lastIndexOf(".")) {
      // Padrão brasileiro: 1.250,50
      str = str.replace(/\./g, "").replace(",", ".");
    } else {
      // Padrão internacional: 1,250.50
      str = str.replace(/,/g, "");
    }
  } else if (hasComma) {
    // Apenas vírgula: 12,50 -> 12.50
    str = str.replace(",", ".");
  } else if (hasDot) {
    const parts = str.split(".");
    if (parts.length > 2) {
      // Múltiplos pontos (ex: 1.000.000) -> milhares
      str = str.replace(/\./g, "");
    } else {
      // Apenas um ponto:
      // Se tiver 1 ou 2 dígitos decimais (ex: 12.5 ou 12.50), trata como decimal!
      const decimalPart = parts[1];
      if (decimalPart && decimalPart.length <= 2) {
        // Mantém o ponto como decimal
      } else {
        // Ex: 1.250 -> 1250
        str = str.replace(/\./g, "");
      }
    }
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Formata um valor numérico ou string como moeda brasileira (BRL)
 * Ex: 12.5 -> R$ 12,50 | "12,50" -> R$ 12,50
 */
export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "R$ 0,00";
  const num = parseCurrencyInput(value);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

/**
 * Formata um valor simples sem o prefixo R$
 * Ex: 12.5 -> 12,50 | 1250.5 -> 1.250,50
 */
export function formatNumberBRL(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "0,00";
  const num = parseCurrencyInput(value);

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Formata uma data para o padrão brasileiro DD/MM/YYYY
 * Imune a variações de fuso horário UTC negativo (ex: UTC-3 / UTC-4)
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  try {
    if (typeof date === "string") {
      const trimmed = date.trim();
      // Formato ISO simples YYYY-MM-DD ou YYYY-MM-DDT...
      const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) {
        const [, year, month, day] = isoMatch;
        return `${day}/${month}/${year}`;
      }
      // Já está no formato DD/MM/YYYY
      const brMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
      if (brMatch) {
        return brMatch[0];
      }
    }

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
 * Formata para DD/MM/AAAA (sinônimo explícito de formatDate)
 */
export const formatDateBR = formatDate;

/**
 * Converte data string (DD/MM/AAAA ou YYYY-MM-DD) para Date seguro ao meio-dia local
 * Isso evita qualquer problema de fusos UTC-3 / UTC-4 retrocederem o dia
 */
export function parseDateSafe(dateStr: string | Date | null | undefined): Date | null {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return isValid(dateStr) ? dateStr : null;

  const str = String(dateStr).trim();

  // DD/MM/AAAA
  const brMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brMatch) {
    const day = parseInt(brMatch[1], 10);
    const month = parseInt(brMatch[2], 10) - 1;
    const year = parseInt(brMatch[3], 10);
    const d = new Date(year, month, day, 12, 0, 0);
    return isValid(d) ? d : null;
  }

  // YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const d = new Date(year, month, day, 12, 0, 0);
    return isValid(d) ? d : null;
  }

  const fallback = new Date(str);
  return isValid(fallback) ? fallback : null;
}

/**
 * Converte qualquer data (Date, DD/MM/AAAA ou ISO) para YYYY-MM-DD
 */
export function parseDateToISOString(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "";
  if (typeof dateStr === "string") {
    const trimmed = dateStr.trim();
    // Se já for YYYY-MM-DD
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

    // Se for DD/MM/AAAA
    const brMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (brMatch) {
      const day = brMatch[1].padStart(2, "0");
      const month = brMatch[2].padStart(2, "0");
      const year = brMatch[3];
      return `${year}-${month}-${day}`;
    }
  }

  const d = dateStr instanceof Date ? dateStr : new Date(dateStr);
  if (!isValid(d)) return "";
  return format(d, "yyyy-MM-dd");
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
 * Formata para input (DD/MM/AAAA por padrão ou YYYY-MM-DD se necessário)
 */
export function formatDateInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  return formatDate(date);
}

/**
 * Formata para input type="date" (YYYY-MM-DD)
 */
export function formatDateInputISO(date: Date | string | null | undefined): string {
  return parseDateToISOString(date);
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
