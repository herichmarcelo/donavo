"use client";

import * as React from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, CheckCircle2, Calendar } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";

interface UpcomingBillsProps {
  contas: any[];
  onRefresh?: () => void;
}

export function UpcomingBills({ contas, onRefresh }: UpcomingBillsProps) {
  const { openPagarModal } = useUIStore();

  return (
    <Card className="rounded-2xl border-border shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base md:text-lg font-serif">
              A Vencer nos Próximos 7 Dias
            </CardTitle>
            {contas.length > 0 && (
              <Badge variant="warning" className="text-[10px]">
                {contas.length} {contas.length === 1 ? "conta" : "contas"}
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            Despesas com vencimento iminente
          </CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-xs text-primary gap-1">
          <Link href="/contas">
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-1">
        {contas.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <div className="mx-auto w-10 h-10 rounded-full bg-success/15 text-success flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-foreground">Tudo em dia!</p>
            <p className="text-xs text-muted-foreground">
              Não há contas com vencimento programado para os próximos 7 dias.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {contas.map((conta) => (
              <div
                key={conta.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {conta.fornecedor}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span className="truncate">{conta.discriminacao || "Despesa"}</span>
                      <span>•</span>
                      <span className="text-amber-600 dark:text-amber-400 font-medium shrink-0">
                        Vence {formatDate(conta.dataVencimento)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-sm font-bold text-foreground">
                    {formatCurrency(conta.valor)}
                  </span>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => openPagarModal(conta)}
                    className="h-8 px-2.5 text-xs rounded-lg shadow-none"
                  >
                    Pagar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
