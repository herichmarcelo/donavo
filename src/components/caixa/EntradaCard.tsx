"use client";

import * as React from "react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CircleDollarSign, Trash2, User } from "lucide-react";

interface EntradaCardProps {
  entrada: any;
  onDelete: (id: string) => void;
}

export function EntradaCard({ entrada, onDelete }: EntradaCardProps) {
  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case "VENDA":
        return <Badge variant="success">Venda</Badge>;
      case "OUTROS":
        return <Badge variant="secondary">Outros</Badge>;
      default:
        return <Badge variant="info">Manual</Badge>;
    }
  };

  const valorTotal = Number(entrada.valorTotal ?? entrada.valor ?? 0);
  const valorDinheiro = Number(entrada.valorDinheiro || 0);
  const valorDebito = Number(entrada.valorDebito || 0);
  const valorCredito = Number(entrada.valorCredito || 0);
  const valorPix = Number(entrada.valorPix || 0);
  const valorVoucher = Number(entrada.valorVoucher || 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 transition-all duration-200 shadow-xs hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {getTipoBadge(entrada.tipo)}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(entrada.dataEntrada)}
            </span>
          </div>
          <h4 className="text-base font-bold text-foreground truncate">
            {entrada.descricao}
          </h4>
          {entrada.observacao && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {entrada.observacao}
            </p>
          )}

          {/* Detalhamento das formas de pagamento com valor > 0 */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap text-2xs font-medium">
            {valorDinheiro > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                Dinheiro: {formatCurrency(valorDinheiro)}
              </span>
            )}
            {valorDebito > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                Débito: {formatCurrency(valorDebito)}
              </span>
            )}
            {valorCredito > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                Crédito: {formatCurrency(valorCredito)}
              </span>
            )}
            {valorPix > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
                PIX: {formatCurrency(valorPix)}
              </span>
            )}
            {valorVoucher > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                Voucher: {formatCurrency(valorVoucher)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
            +{formatCurrency(valorTotal)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(entrada.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive mt-1 rounded-lg"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
