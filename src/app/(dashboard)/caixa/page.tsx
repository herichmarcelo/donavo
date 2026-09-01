"use client";

import * as React from "react";
import Link from "next/link";
import {
  CircleDollarSign,
  Plus,
  TrendingUp,
  Calendar,
  Search,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { EntradaCard } from "@/components/caixa/EntradaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export default function CaixaPage() {
  const { toast } = useToast();
  const [entradas, setEntradas] = React.useState<any[]>([]);
  const [resumo, setResumo] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const [mes, setMes] = React.useState<string>((new Date().getMonth() + 1).toString());
  const [ano, setAno] = React.useState<string>("2026");
  const [tipo, setTipo] = React.useState<string>("TODOS");
  const [busca, setBusca] = React.useState<string>("");

  const [entradaToDelete, setEntradaToDelete] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchEntradas = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (mes) params.append("mes", mes);
      if (ano) params.append("ano", ano);
      if (tipo && tipo !== "TODOS") params.append("tipo", tipo);
      if (busca) params.append("busca", busca);

      const res = await fetch(`/api/caixa?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEntradas(data.entradas || []);
        setResumo(data.resumo || null);
      }
    } catch (error) {
      console.error("Erro ao carregar entradas:", error);
    } finally {
      setLoading(false);
    }
  }, [mes, ano, tipo, busca]);

  React.useEffect(() => {
    fetchEntradas();
  }, [fetchEntradas]);

  const confirmDelete = async () => {
    if (!entradaToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/caixa/${entradaToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir entrada");

      toast({
        variant: "success",
        title: "Entrada excluída",
        description: "A entrada foi removida com sucesso.",
      });

      setEntradaToDelete(null);
      fetchEntradas();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir a entrada.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const meses = [
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

  return (
    <div className="space-y-6 animate-fade-in relative pb-16">
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            Entradas de Caixa
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Registro cronológico de receitas e entradas manuais de dinheiro
          </p>
        </div>

        <Button
          asChild
          className="rounded-xl bg-success hover:bg-success/90 text-white h-10 text-xs font-semibold gap-1.5 shadow-md shadow-success/20 self-start sm:self-auto"
        >
          <Link href="/caixa/nova">
            <Plus className="h-4 w-4" />
            <span>Nova Entrada</span>
          </Link>
        </Button>
      </div>

      {/* KPI Cards de Caixa */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Total do Mês */}
          <div className="p-5 rounded-2xl border border-success/20 bg-success/5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-success uppercase tracking-wider">
                Total do Período
              </span>
              <p className="text-2xl md:text-3xl font-bold text-success mt-1">
                {formatCurrency(resumo?.totalPeriodo || 0)}
              </p>
              <span className="text-xs text-muted-foreground">
                {resumo?.totalEntradas || 0} lançamentos registrados
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-success/15 text-success">
              <TrendingUp className="h-7 w-7" />
            </div>
          </div>

          {/* Entradas de Hoje */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Entradas de Hoje
              </span>
              <p className="text-2xl md:text-3xl font-bold text-foreground mt-1">
                {formatCurrency(resumo?.totalHoje || 0)}
              </p>
              <span className="text-xs text-muted-foreground">
                {formatDate(new Date())}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-primary/10 text-primary">
              <CircleDollarSign className="h-7 w-7" />
            </div>
          </div>
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição ou observação..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-background text-sm"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Select value={tipo} onValueChange={(val) => setTipo(val)}>
            <SelectTrigger className="h-10 rounded-xl text-xs">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos os Tipos</SelectItem>
              <SelectItem value="MANUAL">Manual</SelectItem>
              <SelectItem value="VENDA">Venda</SelectItem>
              <SelectItem value="OUTROS">Outros</SelectItem>
            </SelectContent>
          </Select>

          <Select value={mes} onValueChange={(val) => setMes(val)}>
            <SelectTrigger className="h-10 rounded-xl text-xs">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {meses.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={ano} onValueChange={(val) => setAno(val)}>
            <SelectTrigger className="h-10 rounded-xl text-xs">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2027">2027</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            onClick={() => {
              setTipo("TODOS");
              setMes((new Date().getMonth() + 1).toString());
              setAno("2026");
              setBusca("");
            }}
            className="h-10 rounded-xl text-xs gap-1 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Limpar
          </Button>
        </div>
      </div>

      {/* Lista de Entradas */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : entradas.length === 0 ? (
        <div className="text-center py-16 px-4 bg-card rounded-2xl border border-border space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-success/15 text-success flex items-center justify-center">
            <CircleDollarSign className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Nenhuma entrada registrada
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Não há lançamentos de caixa no período selecionado.
          </p>
          <Button asChild size="sm" className="rounded-xl mt-2 bg-success text-white">
            <Link href="/caixa/nova">
              <Plus className="h-4 w-4 mr-1.5" />
              Registrar Entrada
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {entradas.map((entrada) => (
            <EntradaCard
              key={entrada.id}
              entrada={entrada}
              onDelete={(id) => setEntradaToDelete(id)}
            />
          ))}
        </div>
      )}

      {/* Floating Action Button (Mobile FAB) */}
      <div className="lg:hidden fixed right-5 bottom-20 z-30">
        <Button
          asChild
          size="icon"
          className="h-14 w-14 rounded-full bg-success hover:bg-success/90 text-white shadow-xl shadow-success/30 active:scale-95"
        >
          <Link href="/caixa/nova" aria-label="Nova Entrada">
            <Plus className="h-7 w-7" />
          </Link>
        </Button>
      </div>

      {/* Dialog de Exclusão */}
      <Dialog open={!!entradaToDelete} onOpenChange={() => setEntradaToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Deseja remover esta entrada de caixa?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEntradaToDelete(null)}
              disabled={isDeleting}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="rounded-xl font-semibold"
            >
              {isDeleting ? "Excluindo..." : "Sim, Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
