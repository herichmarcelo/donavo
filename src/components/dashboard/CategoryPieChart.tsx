"use client";

import * as React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryItem {
  name: string;
  value: number;
  color: string;
}

interface CategoryPieChartProps {
  data: CategoryItem[];
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="rounded-xl border border-border bg-popover/95 p-3 shadow-lg backdrop-blur-md text-xs space-y-1">
          <p className="font-semibold text-foreground">{item.name}</p>
          <p className="text-primary font-bold">{formatCurrency(item.value)}</p>
          <p className="text-muted-foreground">{percent}% do total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="rounded-2xl border-border shadow-sm flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg font-serif">
          Distribuição por Categoria
        </CardTitle>
        <CardDescription className="text-xs">
          Custeio, Investimento e Outras despesas
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center pt-2">
        {total === 0 ? (
          <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground">
            Nenhuma despesa registrada no período
          </div>
        ) : (
          <>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="hsl(var(--card))"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
              {data.map((item) => {
                const percent = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
                return (
                  <div key={item.name} className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[11px] font-medium text-foreground truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      {percent}%
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
