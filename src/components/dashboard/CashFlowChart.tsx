"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CashFlowItem {
  mes: string;
  entradas: number;
  saidas: number;
}

interface CashFlowChartProps {
  data: CashFlowItem[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-border bg-popover/95 p-3 shadow-lg backdrop-blur-md text-xs space-y-1.5 min-w-[150px]">
          <p className="font-semibold text-foreground border-b border-border pb-1">
            {label}
          </p>
          <div className="flex items-center justify-between gap-3 text-emerald-600 dark:text-emerald-400">
            <span>Entradas:</span>
            <span className="font-bold">{formatCurrency(payload[0]?.value)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-primary">
            <span>Despesas:</span>
            <span className="font-bold">{formatCurrency(payload[1]?.value)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/60 font-semibold text-foreground">
            <span>Saldo:</span>
            <span>
              {formatCurrency(
                (payload[0]?.value || 0) - (payload[1]?.value || 0)
              )}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="rounded-2xl border-border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base md:text-lg font-serif">
              Fluxo de Caixa (Últimos 6 Meses)
            </CardTitle>
            <CardDescription className="text-xs">
              Comparativo de entradas manuais vs contas a pagar
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4A7C59" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4A7C59" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A83A1F" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#A83A1F" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
                opacity={0.6}
              />
              <XAxis
                dataKey="mes"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) =>
                  val >= 1000 ? `R$ ${(val / 1000).toFixed(0)}k` : `R$ ${val}`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: "10px", fontSize: "12px" }}
              />
              <Area
                type="monotone"
                name="Entradas"
                dataKey="entradas"
                stroke="#4A7C59"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorEntradas)"
              />
              <Area
                type="monotone"
                name="Despesas"
                dataKey="saidas"
                stroke="#A83A1F"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorSaidas)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
