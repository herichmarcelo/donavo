"use client";

import * as React from "react";
import Link from "next/link";
import {
  Download,
  FilePlus,
  Loader2,
  Plus,
  Receipt,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Edit2,
  MoreVertical,
} from "lucide-react";
import { useContasStore } from "@/store/useContasStore";
import { useUIStore } from "@/store/useUIStore";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { exportContasToCSV } from "@/lib/export/csv";
import { FiltroContas } from "@/components/contas/FiltroContas";
import { ContaCard } from "@/components/contas/ContaCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

export default function ContasPage() {
  const { filtros, refreshKey, triggerRefresh } = useContasStore();
  const { openPagarModal } = useUIStore();
  const { toast } = useToast();

  const [contas, setContas] = React.useState<any[]>([]);
  const [resumo, setResumo] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const [contaToDelete, setContaToDelete] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchContas = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtros.status && filtros.status !== "TODOS") params.append("status", filtros.status);
      if (filtros.categoria && filtros.categoria !== "TODAS") params.append("categoria", filtros.categoria);
      if (filtros.mes) params.append("mes", filtros.mes.toString());
      if (filtros.ano) params.append("ano", filtros.ano.toString());
      if (filtros.busca) params.append("busca", filtros.busca);

      const res = await fetch(`/api/contas?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setContas(data.contas || []);
        setResumo(data.resumo || null);
      }
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  React.useEffect(() => {
    fetchContas();
  }, [fetchContas, refreshKey]);

  const confirmDelete = async () => {
    if (!contaToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/contas/${contaToDelete}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erro ao excluir conta");

      toast({
        variant: "success",
        title: "Conta excluída",
        description: "A conta foi removida com sucesso.",
      });

      setContaToDelete(null);
      triggerRefresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir a conta.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (contas.length === 0) {
      toast({
        variant: "destructive",
        title: "Sem dados",
        description: "Não há contas na listagem atual para exportar.",
      });
      return;
    }
    exportContasToCSV(contas, `contas-donavo-${filtros.mes || "todos"}-${filtros.ano || "2026"}.csv`);
    toast({
      variant: "success",
      title: "Exportação concluída",
      description: "O arquivo CSV foi baixado com sucesso.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in relative pb-16">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            Contas a Pagar
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gerencie todas as obrigações financeiras e pagamentos do restaurante
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
            <span>Exportar CSV</span>
          </Button>

          <Button
            asChild
            className="rounded-xl bg-primary hover:bg-brand-terracottaDark text-white h-10 text-xs font-semibold gap-1.5 shadow-md shadow-primary/20"
          >
            <Link href="/contas/nova">
              <Plus className="h-4 w-4" />
              <span>Nova Conta</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Resumo do Período no Topo */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : resumo ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total Geral */}
          <div className="p-3.5 rounded-2xl border border-border bg-card shadow-xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
              Total Despesas
            </span>
            <p className="text-lg md:text-xl font-bold text-foreground mt-0.5">
              {formatCurrency(resumo.totalGeral)}
            </p>
            <span className="text-[10px] text-muted-foreground">
              {resumo.totalContas} contas no período
            </span>
          </div>

          {/* Total Pago */}
          <div className="p-3.5 rounded-2xl border border-success/20 bg-success/5 shadow-xs">
            <span className="text-[11px] font-semibold text-success uppercase">
              Total Pago
            </span>
            <p className="text-lg md:text-xl font-bold text-success mt-0.5">
              {formatCurrency(resumo.totalPago)}
            </p>
            <span className="text-[10px] text-muted-foreground">
              Liquidado no período
            </span>
          </div>

          {/* Total a Pagar */}
          <div className="p-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 shadow-xs">
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase">
              A Pagar
            </span>
            <p className="text-lg md:text-xl font-bold text-amber-700 dark:text-amber-400 mt-0.5">
              {formatCurrency(resumo.totalPendente)}
            </p>
            <span className="text-[10px] text-muted-foreground">
              Pendente / Vencido
            </span>
          </div>

          {/* Saldo / Diferença */}
          <div className="p-3.5 rounded-2xl border border-border bg-muted/30 shadow-xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
              Diferença
            </span>
            <p className="text-lg md:text-xl font-bold text-foreground mt-0.5">
              {formatCurrency(resumo.diferenca)}
            </p>
            <span className="text-[10px] text-muted-foreground">
              Restante a quitar
            </span>
          </div>
        </div>
      ) : null}

      {/* Componente de Filtros */}
      <FiltroContas />

      {/* Listagem de Contas */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : contas.length === 0 ? (
        <div className="text-center py-16 px-4 bg-card rounded-2xl border border-border space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Receipt className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Nenhuma conta encontrada
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Não encontramos contas com os filtros selecionados. Tente ajustar os filtros ou cadastre uma nova conta.
          </p>
          <Button asChild size="sm" className="rounded-xl mt-2 bg-primary text-white">
            <Link href="/contas/nova">
              <Plus className="h-4 w-4 mr-1.5" />
              Cadastrar Nova Conta
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Mobile View: Cards Grid */}
          <div className="block lg:hidden space-y-3">
            {contas.map((conta) => (
              <ContaCard
                key={conta.id}
                conta={conta}
                onDelete={(id) => setContaToDelete(id)}
              />
            ))}
          </div>

          {/* Desktop View: Styled Table */}
          <div className="hidden lg:block rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase border-b border-border">
                <tr>
                  <th className="py-3.5 px-4">Fornecedor / Descrição</th>
                  <th className="py-3.5 px-4">Vencimento</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Valor Original</th>
                  <th className="py-3.5 px-4 text-right">Valor Pago</th>
                  <th className="py-3.5 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {contas.map((conta) => {
                  const isPaga = conta.status === "PAGA";
                  return (
                    <tr
                      key={conta.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground">
                          {conta.fornecedor}
                        </div>
                        {conta.discriminacao && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {conta.discriminacao}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-foreground whitespace-nowrap">
                        {formatDate(conta.dataVencimento)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            conta.categoria === "INVESTIMENTO"
                              ? "investimento"
                              : conta.categoria === "OUTRAS"
                              ? "outras"
                              : "custeio"
                          }
                        >
                          {conta.categoria}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            conta.status === "PAGA"
                              ? "paga"
                              : conta.status === "VENCIDA"
                              ? "vencida"
                              : conta.status === "CANCELADA"
                              ? "cancelada"
                              : "pendente"
                          }
                        >
                          {conta.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-foreground whitespace-nowrap">
                        {formatCurrency(conta.valor)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {conta.valorPago ? formatCurrency(conta.valorPago) : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {!isPaga && (
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => openPagarModal(conta)}
                              className="h-8 px-2.5 rounded-lg text-xs font-semibold"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Pagar
                            </Button>
                          )}
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                          >
                            <Link href={`/contas/${conta.id}`}>
                              <Edit2 className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setContaToDelete(conta.id)}
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Floating Action Button (Mobile FAB) */}
      <div className="lg:hidden fixed right-5 bottom-20 z-30">
        <Button
          asChild
          size="icon"
          className="h-14 w-14 rounded-full bg-primary hover:bg-brand-terracottaDark text-white shadow-xl shadow-primary/30 active:scale-95"
        >
          <Link href="/contas/nova" aria-label="Nova Conta">
            <Plus className="h-7 w-7" />
          </Link>
        </Button>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={!!contaToDelete} onOpenChange={() => setContaToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta conta a pagar? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setContaToDelete(null)}
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
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Sim, Excluir Conta"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
