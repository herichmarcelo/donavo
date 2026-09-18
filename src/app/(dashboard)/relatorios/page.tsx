"use client";

import * as React from "react";
import {
  Download,
  FileText,
  Filter,
  Loader2,
  PieChart as PieIcon,
  Store,
  Calendar,
  Search,
  RotateCcw,
  SlidersHorizontal,
  TrendingUp,
  CircleDollarSign,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { exportRelatorioToPDF } from "@/lib/export/pdf";
import { exportContasToCSV } from "@/lib/export/csv";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const meses = [
  { value: "todos", label: "Ano Todo (Todos os meses)" },
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

const mesesAbrev = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default function RelatoriosPage() {
  const { toast } = useToast();

  const hoje = React.useMemo(() => new Date(), []);
  const anoAtual = hoje.getFullYear();
  const mesAtualNum = hoje.getMonth() + 1; // 1-12
  const mesAnteriorNum = mesAtualNum === 1 ? 12 : mesAtualNum - 1;
  const anoMesAnterior = mesAtualNum === 1 ? anoAtual - 1 : anoAtual;

  const anos = React.useMemo(() => {
    const list: string[] = [];
    for (let y = anoAtual - 2; y <= anoAtual + 2; y++) {
      list.push(String(y));
    }
    return list;
  }, [anoAtual]);

  const labelMesAtualPreset = `Mês Atual (${mesesAbrev[mesAtualNum - 1]}/${String(anoAtual).slice(-2)})`;
  const labelMesAnteriorPreset = `Mês Anterior (${mesesAbrev[mesAnteriorNum - 1]}/${String(anoMesAnterior).slice(-2)})`;
  const labelAnoTodoPreset = `Ano Todo (${anoAtual})`;

  // Estados dos Filtros
  const [modoFiltro, setModoFiltro] = React.useState<"preset" | "mes-ano" | "custom">("preset");
  const [preset, setPreset] = React.useState<string>("mes-anterior"); // Padrão inteligente: Mês anterior (onde há contas)
  const [mes, setMes] = React.useState<string>(String(mesAnteriorNum));
  const [ano, setAno] = React.useState<string>(String(anoMesAnterior));
  const [dataInicio, setDataInicio] = React.useState<string>("");
  const [dataFim, setDataFim] = React.useState<string>("");
  const [categoria, setCategoria] = React.useState<string>("TODAS");
  const [status, setStatus] = React.useState<string>("TODOS");
  const [busca, setBusca] = React.useState<string>("");
  const [mostrarCustomDates, setMostrarCustomDates] = React.useState(false);

  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchRelatorio = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (modoFiltro === "custom" && dataInicio && dataFim) {
        params.append("dataInicio", dataInicio);
        params.append("dataFim", dataFim);
      } else if (modoFiltro === "preset") {
        params.append("periodo", preset);
      } else {
        if (mes) params.append("mes", mes);
        if (ano) params.append("ano", ano);
      }

      if (categoria && categoria !== "TODAS") params.append("categoria", categoria);
      if (status && status !== "TODOS") params.append("status", status);
      if (busca.trim()) params.append("busca", busca.trim());

      const res = await fetch(`/api/relatorios?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
    } finally {
      setLoading(false);
    }
  }, [modoFiltro, preset, mes, ano, dataInicio, dataFim, categoria, status, busca]);

  React.useEffect(() => {
    fetchRelatorio();
  }, [fetchRelatorio]);

  const getPeriodoLabel = () => {
    if (data?.periodoLabel) return data.periodoLabel;
    if (modoFiltro === "custom" && dataInicio && dataFim) return `${dataInicio} a ${dataFim}`;
    if (modoFiltro === "preset") {
      switch (preset) {
        case "mes-atual":
          return `Mês Atual (${meses[mesAtualNum]?.label || ""} ${anoAtual})`;
        case "mes-anterior":
          return `Mês Anterior (${meses[mesAnteriorNum]?.label || ""} ${anoMesAnterior})`;
        case "ultimos-3-meses":
          return "Últimos 3 Meses";
        case "ano-todo":
          return `Ano Todo (${anoAtual})`;
        default:
          return "Período Selecionado";
      }
    }
    const mesObj = meses.find((m) => m.value === mes);
    return `${mesObj?.label || "Mês"} de ${ano}`;
  };

  const handleSelectPreset = (p: string) => {
    setModoFiltro("preset");
    setPreset(p);
    setMostrarCustomDates(false);
    if (p === "mes-anterior") {
      setMes(String(mesAnteriorNum));
      setAno(String(anoMesAnterior));
    } else if (p === "mes-atual") {
      setMes(String(mesAtualNum));
      setAno(String(anoAtual));
    } else if (p === "ano-todo") {
      setMes("todos");
      setAno(String(anoAtual));
    }
  };

  const handleSelectMes = (m: string) => {
    setModoFiltro("mes-ano");
    setMes(m);
    setMostrarCustomDates(false);
  };

  const handleSelectAno = (a: string) => {
    setModoFiltro("mes-ano");
    setAno(a);
    setMostrarCustomDates(false);
  };

  const handleLimparFiltros = () => {
    setModoFiltro("preset");
    setPreset("mes-anterior");
    setMes(String(mesAnteriorNum));
    setAno(String(anoMesAnterior));
    setDataInicio("");
    setDataFim("");
    setCategoria("TODAS");
    setStatus("TODOS");
    setBusca("");
    setMostrarCustomDates(false);
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

    const labelPeriodo = getPeriodoLabel();

    exportRelatorioToPDF(
      {
        titulo: "Relatório de Contas a Pagar — Dona Vó",
        periodo: labelPeriodo,
        contas: data.contas,
        resumo: data.resumo,
      },
      `relatorio-donavo-${labelPeriodo.toLowerCase().replace(/[^a-z0-9]/g, "-")}.pdf`
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

    const labelPeriodo = getPeriodoLabel();

    exportContasToCSV(
      data.contas,
      `contas-donavo-${labelPeriodo.toLowerCase().replace(/[^a-z0-9]/g, "-")}.csv`
    );

    toast({
      variant: "success",
      title: "CSV Gerado!",
      description: "O arquivo CSV foi exportado.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header & Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            Relatórios Financeiros
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Análises e totalizações completas por período, fornecedor e categoria
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

      {/* Barra de Filtros Dinâmica e Flexível (SaaS) */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-xs space-y-3">
        {/* Presets Rápidos de Período */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Button
            type="button"
            size="sm"
            variant={modoFiltro === "preset" && preset === "mes-anterior" ? "default" : "outline"}
            onClick={() => handleSelectPreset("mes-anterior")}
            className="rounded-xl text-xs h-9 px-3 shrink-0"
          >
            {labelMesAnteriorPreset}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={modoFiltro === "preset" && preset === "mes-atual" ? "default" : "outline"}
            onClick={() => handleSelectPreset("mes-atual")}
            className="rounded-xl text-xs h-9 px-3 shrink-0"
          >
            {labelMesAtualPreset}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={modoFiltro === "preset" && preset === "ultimos-3-meses" ? "default" : "outline"}
            onClick={() => handleSelectPreset("ultimos-3-meses")}
            className="rounded-xl text-xs h-9 px-3 shrink-0"
          >
            Últimos 3 Meses
          </Button>
          <Button
            type="button"
            size="sm"
            variant={modoFiltro === "preset" && preset === "ano-todo" ? "default" : "outline"}
            onClick={() => handleSelectPreset("ano-todo")}
            className="rounded-xl text-xs h-9 px-3 shrink-0"
          >
            {labelAnoTodoPreset}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mostrarCustomDates ? "default" : "outline"}
            onClick={() => {
              setMostrarCustomDates(!mostrarCustomDates);
              if (!mostrarCustomDates) setModoFiltro("custom");
            }}
            className="rounded-xl text-xs h-9 px-3 shrink-0 gap-1.5"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Intervalo Personalizado</span>
          </Button>
        </div>

        {/* Inputs de Datas Customizadas (se ativado) */}
        {mostrarCustomDates && (
          <div className="p-3 rounded-xl bg-muted/40 border border-border/80 flex flex-col sm:flex-row items-end gap-3 animate-fade-in">
            <div className="space-y-1 w-full sm:w-44">
              <label className="text-2xs font-semibold text-muted-foreground uppercase">
                Data Inicial (DD/MM/AAAA)
              </label>
              <DateInput
                value={dataInicio}
                onChange={(val) => {
                  setDataInicio(val);
                  setModoFiltro("custom");
                }}
                className="h-9 text-xs rounded-lg"
              />
            </div>
            <div className="space-y-1 w-full sm:w-44">
              <label className="text-2xs font-semibold text-muted-foreground uppercase">
                Data Final (DD/MM/AAAA)
              </label>
              <DateInput
                value={dataFim}
                onChange={(val) => {
                  setDataFim(val);
                  setModoFiltro("custom");
                }}
                className="h-9 text-xs rounded-lg"
              />
            </div>
            <Button
              size="sm"
              onClick={fetchRelatorio}
              className="h-9 rounded-lg text-xs font-semibold bg-primary text-white"
            >
              Aplicar Datas
            </Button>
          </div>
        )}

        {/* Dropdowns de Filtro e Busca */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
          {/* Mês */}
          <div>
            <Select value={mes} onValueChange={handleSelectMes}>
              <SelectTrigger className="h-10 rounded-xl text-xs">
                <SelectValue placeholder="Selecione o Mês" />
              </SelectTrigger>
              <SelectContent>
                {meses.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ano */}
          <div>
            <Select value={ano} onValueChange={handleSelectAno}>
              <SelectTrigger className="h-10 rounded-xl text-xs">
                <SelectValue placeholder="Selecione o Ano" />
              </SelectTrigger>
              <SelectContent>
                {anos.map((a) => (
                  <SelectItem key={a} value={a}>
                    Ano {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Categoria */}
          <div>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="h-10 rounded-xl text-xs">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas as Categorias</SelectItem>
                <SelectItem value="CUSTEIO">Custeio (Insumos/Op.)</SelectItem>
                <SelectItem value="INVESTIMENTO">Investimento</SelectItem>
                <SelectItem value="OUTRAS">Outras</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-10 rounded-xl text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os Status</SelectItem>
                <SelectItem value="PAGA">Pagas</SelectItem>
                <SelectItem value="PENDENTE_OU_VENCIDA">A Pagar (Pend./Venc.)</SelectItem>
                <SelectItem value="PENDENTE">Apenas Pendentes</SelectItem>
                <SelectItem value="VENCIDA">Apenas Vencidas</SelectItem>
                <SelectItem value="CANCELADA">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Busca Textual */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar fornecedor..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-8 h-10 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Barra de Status do Período Ativo & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Visualizando:</span>
            <Badge variant="secondary" className="font-bold text-foreground text-xs px-2.5 py-0.5">
              {getPeriodoLabel()}
            </Badge>
            <span className="text-muted-foreground text-2xs">
              ({data?.resumo?.totalContas || 0} contas encontradas)
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLimparFiltros}
            className="h-8 rounded-lg text-xs gap-1 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Resetar Filtros</span>
          </Button>
        </div>
      </div>

      {/* Resumo do Período (KPI Cards) */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : data?.resumo ? (
        <div className="space-y-3">
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

          {/* Destaque Opcional: Entradas de Caixa no mesmo período se existirem */}
          {data.resumo.totalReceitas > 0 && (
            <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-foreground">
                  Entradas de Caixa Computadas no Período:
                </span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatCurrency(data.resumo.totalReceitas)}
                </span>
                <span className="text-muted-foreground text-2xs">
                  ({data.resumo.qtdEntradas} lançamentos de caixa)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Saldo Líquido (Receitas - Pago):</span>
                <span className={`font-bold text-sm ${data.resumo.saldoLiquido >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                  {formatCurrency(data.resumo.saldoLiquido)}
                </span>
              </div>
            </div>
          )}
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
