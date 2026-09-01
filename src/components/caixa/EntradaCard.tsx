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

  return (
    <div className="rounded-2xl border border-border bg-card p-4 transition-all duration-200 shadow-xs hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
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
        </div>

        <div className="flex flex-col items-end shrink-0">
          <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
            +{formatCurrency(entrada.valor)}
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
