import Papa from "papaparse";
import { formatCurrency, formatDate } from "@/lib/formatters";

export interface ContaExportData {
  fornecedor: string;
  discriminacao?: string | null;
  valor: number | string;
  dataVencimento: string | Date;
  status: string;
  dataPagamento?: string | Date | null;
  valorPago?: number | string | null;
  categoria: string;
  observacao?: string | null;
}

export function exportContasToCSV(contas: ContaExportData[], filename = "contas-donavo.csv") {
  const rows = contas.map((conta) => ({
    Fornecedor: conta.fornecedor,
    Discriminação: conta.discriminacao || "-",
    "Valor Original": formatCurrency(conta.valor),
    Vencimento: formatDate(conta.dataVencimento),
    Status: conta.status,
    "Data Pagamento": conta.dataPagamento ? formatDate(conta.dataPagamento) : "-",
    "Valor Pago": conta.valorPago ? formatCurrency(conta.valorPago) : "-",
    Categoria: conta.categoria,
    Observações: conta.observacao || "-",
  }));

  const csv = Papa.unparse(rows, {
    delimiter: ";",
    header: true,
  });

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
