"use client";

import * as React from "react";
import { Search, Filter, RotateCcw } from "lucide-react";
import { useContasStore } from "@/store/useContasStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FiltroContas() {
  const { filtros, setFiltros, resetFiltros } = useContasStore();

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

  const anos = ["2025", "2026", "2027"];

  return (
    <div className="bg-card p-4 rounded-2xl border border-border shadow-xs space-y-3">
      {/* Busca Principal */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por fornecedor, descrição ou observação..."
          value={filtros.busca || ""}
          onChange={(e) => setFiltros({ busca: e.target.value })}
          className="pl-10 h-11 rounded-xl bg-background text-sm"
        />
      </div>

      {/* Grid de Dropdowns de Filtro */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Status */}
        <div>
          <Select
            value={filtros.status || "TODOS"}
            onValueChange={(val) => setFiltros({ status: val })}
          >
            <SelectTrigger className="h-10 rounded-xl text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos os Status</SelectItem>
              <SelectItem value="PENDENTE">Pendentes</SelectItem>
              <SelectItem value="PAGA">Pagas</SelectItem>
              <SelectItem value="VENCIDA">Vencidas</SelectItem>
              <SelectItem value="CANCELADA">Canceladas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Categoria */}
        <div>
          <Select
            value={filtros.categoria || "TODAS"}
            onValueChange={(val) => setFiltros({ categoria: val })}
          >
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

        {/* Mês */}
        <div>
          <Select
            value={filtros.mes?.toString() || ""}
            onValueChange={(val) => setFiltros({ mes: parseInt(val) })}
          >
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
        </div>

        {/* Ano */}
        <div className="flex items-center gap-1.5">
          <Select
            value={filtros.ano?.toString() || "2026"}
            onValueChange={(val) => setFiltros({ ano: parseInt(val) })}
          >
            <SelectTrigger className="h-10 rounded-xl text-xs flex-1">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {anos.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            onClick={resetFiltros}
            title="Limpar filtros"
            className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground shrink-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
