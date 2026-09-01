"use client";

import * as React from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Edit2,
  FileText,
  MoreVertical,
  Trash2,
  User,
  CheckCircle2,
} from "lucide-react";
import { useUIStore } from "@/store/useUIStore";

interface ContaCardProps {
  conta: any;
  onDelete: (id: string) => void;
}

export function ContaCard({ conta, onDelete }: ContaCardProps) {
  const [expanded, setExpanded] = React.useState(false);
  const { openPagarModal } = useUIStore();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAGA":
        return <Badge variant="paga">Paga</Badge>;
      case "VENCIDA":
        return <Badge variant="vencida">Vencida</Badge>;
      case "CANCELADA":
        return <Badge variant="cancelada">Cancelada</Badge>;
      default:
        return <Badge variant="pendente">Pendente</Badge>;
    }
  };

  const getCategoriaBadge = (cat: string) => {
    switch (cat) {
      case "INVESTIMENTO":
        return <Badge variant="investimento">Investimento</Badge>;
      case "OUTRAS":
        return <Badge variant="outras">Outras</Badge>;
      default:
        return <Badge variant="custeio">Custeio</Badge>;
    }
  };

  const isPaga = conta.status === "PAGA";

  return (
    <div
      className={`rounded-2xl border border-border bg-card p-4 transition-all duration-200 shadow-xs hover:shadow-md ${
        isPaga ? "opacity-95" : ""
      }`}
    >
      {/* Header do Card */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {getStatusBadge(conta.status)}
            {getCategoriaBadge(conta.categoria)}
          </div>
          <h4 className="text-base font-bold text-foreground truncate">
            {conta.fornecedor}
          </h4>
          {conta.discriminacao && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {conta.discriminacao}
            </p>
          )}
        </div>

        {/* Valor e Ações */}
        <div className="flex flex-col items-end shrink-0">
          <span className="text-base sm:text-lg font-bold text-foreground">
            {formatCurrency(conta.valor)}
          </span>
          {isPaga && conta.valorPago && (
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Pago: {formatCurrency(conta.valorPago)}
            </span>
          )}
        </div>
      </div>

      {/* Info básica: Vencimento & Pagamento */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <span>Vencimento:</span>
          <span className="font-semibold text-foreground">
            {formatDate(conta.dataVencimento)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {!isPaga && (
            <Button
              size="sm"
              variant="success"
              onClick={() => openPagarModal(conta)}
              className="h-8 px-3 rounded-lg text-xs font-semibold"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Pagar
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isPaga && (
                <DropdownMenuItem onClick={() => openPagarModal(conta)}>
                  <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                  <span>Marcar como Paga</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href={`/contas/${conta.id}`}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  <span>Editar Detalhes</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(conta.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Excluir Conta</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Toggle Expandir Detalhes */}
      {(conta.observacao || conta.dataPagamento || conta.usuario?.nome) && (
        <div className="mt-2 pt-2 border-t border-dashed border-border/60">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center gap-1 w-full text-[11px] text-muted-foreground hover:text-foreground py-1"
          >
            <span>{expanded ? "Ocultar detalhes" : "Ver mais detalhes"}</span>
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>

          {expanded && (
            <div className="mt-2 space-y-1.5 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-xl animate-fade-in">
              {conta.dataPagamento && (
                <div className="flex justify-between">
                  <span>Data de Pagamento:</span>
                  <span className="font-semibold text-foreground">
                    {formatDate(conta.dataPagamento)}
                  </span>
                </div>
              )}
              {conta.observacao && (
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">Observação:</span>
                  <p className="text-foreground bg-background/80 p-2 rounded-lg text-[11px]">
                    {conta.observacao}
                  </p>
                </div>
              )}
              {conta.usuario?.nome && (
                <div className="flex justify-between text-[10px] pt-1">
                  <span>Cadastrado por:</span>
                  <span className="font-medium text-foreground">
                    {conta.usuario.nome}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
