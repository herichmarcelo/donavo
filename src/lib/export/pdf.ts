import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "@/lib/formatters";

export interface RelatorioExportOptions {
  titulo: string;
  subtitulo?: string;
  periodo?: string;
  contas: {
    fornecedor: string;
    discriminacao?: string | null;
    valor: number | string;
    dataVencimento: string | Date;
    status: string;
    valorPago?: number | string | null;
    categoria: string;
  }[];
  resumo: {
    totalGeral: number;
    totalPago: number;
    totalPendente: number;
  };
}

export function exportRelatorioToPDF(options: RelatorioExportOptions, filename = "relatorio-donavo.pdf") {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Cabeçalho da Dona Vó (Terracota)
  doc.setFillColor(168, 58, 31); // #A83A1F
  doc.rect(0, 0, 210, 26, "F");

  // Título e logo em texto
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("DONA VÓ GESTÃO", 14, 12);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(options.titulo || "Relatório Financeiro de Contas a Pagar", 14, 19);

  if (options.periodo) {
    doc.text(`Período: ${options.periodo}`, 196, 19, { align: "right" });
  }

  // Bloco de Resumo / KPIs
  let startY = 34;
  doc.setFillColor(253, 248, 243); // #FDF8F3
  doc.roundedRect(14, startY, 182, 20, 2, 2, "F");

  doc.setTextColor(44, 24, 16); // #2C1810
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");

  doc.text("Total de Despesas:", 20, startY + 8);
  doc.setFont("helvetica", "normal");
  doc.text(formatCurrency(options.resumo.totalGeral), 20, startY + 14);

  doc.setFont("helvetica", "bold");
  doc.text("Total Pago:", 85, startY + 8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(74, 124, 89); // Verde oliva
  doc.text(formatCurrency(options.resumo.totalPago), 85, startY + 14);

  doc.setTextColor(44, 24, 16);
  doc.setFont("helvetica", "bold");
  doc.text("A Pagar:", 150, startY + 8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(192, 57, 43); // Vermelho
  doc.text(formatCurrency(options.resumo.totalPendente), 150, startY + 14);

  // Tabela de Contas
  const tableRows = options.contas.map((c) => [
    c.fornecedor,
    c.discriminacao || "-",
    formatDate(c.dataVencimento),
    c.categoria,
    c.status,
    formatCurrency(c.valor),
    c.valorPago ? formatCurrency(c.valorPago) : "-",
  ]);

  autoTable(doc, {
    startY: startY + 26,
    head: [["Fornecedor", "Discriminação", "Vencimento", "Cat.", "Status", "Valor", "Pago"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [168, 58, 31],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [44, 24, 16],
    },
    alternateRowStyles: {
      fillColor: [253, 248, 243],
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 40 },
      2: { cellWidth: 22 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20, halign: "right" },
      6: { cellWidth: 15, halign: "right" },
    },
    foot: [
      [
        "TOTAIS",
        "",
        "",
        "",
        "",
        formatCurrency(options.resumo.totalGeral),
        formatCurrency(options.resumo.totalPago),
      ],
    ],
    footStyles: {
      fillColor: [232, 221, 212],
      textColor: [44, 24, 16],
      fontStyle: "bold",
      fontSize: 8,
    },
  });

  // Rodapé
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(107, 82, 71);
    doc.text(
      `Dona Vó Gestão — Emitido em ${formatDate(new Date())} — Página ${i} de ${pageCount}`,
      14,
      290
    );
  }

  doc.save(filename);
}
