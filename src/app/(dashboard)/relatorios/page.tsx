"use client";

import * as React from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Loader2,
  PieChart as PieIcon,
  Store,
  Calendar,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { exportRelatorioToPDF } from "@/lib/export/pdf";
import { exportContasToCSV } from "@/lib/export/csv";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

export default function RelatoriosPage() {
  const { toast } = useToast();
  const [periodo, setPeriodo] = React.useState<string>("julho-2026");
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchRelatorio = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/relatorios?periodo=${periodo}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  React.useEffect(() => {
    fetchRelatorio();
  }, [fetchRelatorio]);

  const getPeriodoLabel = () => {
    switch (periodo) {
      case "fev-mar-abr-2026":
        return "Fev, Mar e Abr 2026";
      case "maio-2026":
        return "Maio 2026";
      case "junho-2026":
        return "Junho 2026";
      case "julho-2026":
        return "Julho 2026";
      default:
        return "Período Selecionado";
    }
  };

  const handleExportPDF = () => {
    if (!data || !data.contas || data.contas.length === 0) {
      toast({
        variant: "destructive",
        title: "Sem dados",
        description: "Não há contas no período para gerar o PDF.",
      });
      return;
    }

    exportRelatorioToPDF(
      {
        titulo: "Relatório de Contas a Pagar — Dona Vó",
        periodo: getPeriodoLabel(),
        contas: data.contas,
        resumo: data.resumo,
      },
      `relatorio-donavo-${periodo}.pdf`
    );

    toast({
      variant: "success",
      title: "PDF Gerado!",
      description: "O download do relatório foi iniciado.",
    });
  };

  const handleExportCSV = () => {
    if (!data || !data.contas || data.contas.length === 0) {
      toast({
        variant: "destructive",
        title: "Sem dados",
        description: "Não há contas no período para gerar o CSV.",
      });
      return;
    }

    exportContasToCSV(data.contas, `contas-donavo-${periodo}.csv`);

    toast({
      variant: "success",
      title: "CSV Gerado!",
      description: "O arquivo CSV foi exportado.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            Relatórios Financeiros
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Análises e totalizações por período, fornecedor e categoria
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="rounded-xl h-10 text-xs font-semibold gap-1.5"
          >
            <Download className="h-4 w-4" />
            <span>CSV</span>
          </Button>

          <Button
            onClick={handleExportPDF}
            className="rounded-xl bg-primary hover:bg-brand-terracottaDark text-white h-10 text-xs font-semibold gap-1.5 shadow-md shadow-primary/20"
          >
            <FileText className="h-4 w-4" />
            <span>Exportar PDF</span>
          </Button>
        </div>
      </div>

      {/* Seletor de Período (Espelhando as abas do Excel da Dona Vó) */}
      <div className="bg-card p-2 rounded-2xl border border-border shadow-xs">
        <Tabs value={periodo} onValueChange={setPeriodo} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 gap-1 bg-muted/40 rounded-xl">
            <TabsTrigger
              value="fev-mar-abr-2026"
              className="text-xs py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-medium"
            >
              Fev, Mar e Abr 2026
            </TabsTrigger>
            <TabsTrigger
              value="maio-2026"
              className="text-xs py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-medium"
            >
              Maio 2026
            </TabsTrigger>
            <TabsTrigger
              value="junho-2026"
              className="text-xs py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-medium"
            >
              Junho 2026
            </TabsTrigger>
            <TabsTrigger
              value="julho-2026"
              className="text-xs py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-medium"
            >
              Julho 2026
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Resumo do Período */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : data?.resumo ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl border border-border bg-card shadow-xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
              Total Despesas
            </span>
            <p className="text-lg md:text-xl font-bold text-foreground mt-0.5">
              {formatCurrency(data.resumo.totalGeral)}
            </p>
            <span className="text-[10px] text-muted-foreground">
              {data.resumo.totalContas} contas no período
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-success/20 bg-success/5 shadow-xs">
            <span className="text-[11px] font-semibold text-success uppercase">
              Total Pago
            </span>
            <p className="text-lg md:text-xl font-bold text-success mt-0.5">
              {formatCurrency(data.resumo.totalPago)}
            </p>
            <span className="text-[10px] text-muted-foreground">
              {((data.resumo.totalPago / (data.resumo.totalGeral || 1)) * 100).toFixed(1)}% liquidado
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 shadow-xs">
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase">
              A Pagar
            </span>
            <p className="text-lg md:text-xl font-bold text-amber-700 dark:text-amber-400 mt-0.5">
              {formatCurrency(data.resumo.totalPendente)}
            </p>
            <span className="text-[10px] text-muted-foreground">
              Pendente / Vencido
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-muted/30 shadow-xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
              Diferença
            </span>
            <p className="text-lg md:text-xl font-bold text-foreground mt-0.5">
              {formatCurrency(data.resumo.diferenca)}
            </p>
            <span className="text-[10px] text-muted-foreground">
              Restante a pagar
            </span>
          </div>
        </div>
      ) : null}

      {/* Grid: Por Fornecedor & Por Categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Totalização por Fornecedor */}
        <Card className="rounded-2xl border-border shadow-xs flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-serif">
                Total por Fornecedor
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Ranking dos maiores fornecedores do período
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 max-h-[350px] overflow-y-auto">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 rounded-xl" />
                ))}
              </div>
            ) : !data?.porFornecedor || data.porFornecedor.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">
                Sem despesas no período selecionado.
              </p>
            ) : (
              <div className="space-y-2">
                {data.porFornecedor.map((item: any) => (
                  <div
                    key={item.fornecedor}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/60 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">
                        {item.fornecedor}
                      </p>
                      <span className="text-[11px] text-muted-foreground">
                        {item.qtdContas} {item.qtdContas === 1 ? "conta" : "contas"}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-foreground">
                        {formatCurrency(item.total)}
                      </p>
                      {item.totalPago > 0 && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          Pago: {formatCurrency(item.totalPago)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Totalização por Categoria */}
        <Card className="rounded-2xl border-border shadow-xs flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-secondary" />
              <CardTitle className="text-base font-serif">
                Total por Categoria
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Divisão entre Custeio, Investimento e Outras
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 max-h-[350px] overflow-y-auto">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 rounded-xl" />
                ))}
              </div>
            ) : !data?.porCategoria || data.porCategoria.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">
                Sem despesas no período selecionado.
              </p>
            ) : (
              <div className="space-y-2.5">
                {data.porCategoria.map((item: any) => {
                  const totalGeral = data.resumo.totalGeral || 1;
                  const percent = ((item.total / totalGeral) * 100).toFixed(1);
                  return (
                    <div
                      key={item.categoria}
                      className="p-3.5 rounded-xl bg-muted/20 border border-border/60 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground">
                          {item.categoria}
                        </span>
                        <div className="text-right">
                          <span className="font-bold text-foreground">
                            {formatCurrency(item.total)}
                          </span>
                          <span className="text-[11px] text-muted-foreground ml-1.5">
                            ({percent}%)
                          </span>
                        </div>
                      </div>
                      {/* Barra de progresso visual */}
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Extrato Detalhado de Contas */}
      <Card className="rounded-2xl border-border shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-serif">
            Extrato de Contas do Período ({getPeriodoLabel()})
          </CardTitle>
          <CardDescription className="text-xs">
            Lista completa de lançamentos com status e valores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 rounded-xl" />
              ))}
            </div>
          ) : !data?.contas || data.contas.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">
              Nenhuma conta no período selecionado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 font-semibold text-muted-foreground uppercase border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3">Fornecedor</th>
                    <th className="py-2.5 px-3">Discriminação</th>
                    <th className="py-2.5 px-3">Vencimento</th>
                    <th className="py-2.5 px-3">Cat.</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Valor</th>
                    <th className="py-2.5 px-3 text-right">Pago</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.contas.map((c: any) => (
                    <tr key={c.id} className="hover:bg-muted/30">
                      <td className="py-2.5 px-3 font-semibold text-foreground">
                        {c.fornecedor}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground truncate max-w-[180px]">
                        {c.discriminacao || "-"}
                      </td>
                      <td className="py-2.5 px-3">{formatDate(c.dataVencimento)}</td>
                      <td className="py-2.5 px-3">{c.categoria}</td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={
                            c.status === "PAGA"
                              ? "paga"
                              : c.status === "VENCIDA"
                              ? "vencida"
                              : "pendente"
                          }
                          className="text-[10px]"
                        >
                          {c.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold">
                        {formatCurrency(c.valor)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        {c.valorPago ? formatCurrency(c.valorPago) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
