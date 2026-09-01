"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  CircleDollarSign,
  Clock,
  FileSpreadsheet,
  Plus,
  Receipt,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import { UpcomingBills } from "@/components/dashboard/UpcomingBills";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useContasStore } from "@/store/useContasStore";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { refreshKey } = useContasStore();
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchDashboardData = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refreshKey]);

  const userName = session?.user?.nome?.split(" ")[0] || "Gestor";

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 md:p-6 rounded-3xl bg-gradient-to-r from-brand-terracotta to-brand-terracottaLight text-white shadow-md shadow-primary/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-goldLight flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Painel Financeiro
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
            Olá, {userName}!
          </h2>
          <p className="text-xs sm:text-sm text-white/90">
            Acompanhe suas despesas, entradas e saúde financeira do restaurante.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            asChild
            variant="secondary"
            size="default"
            className="rounded-xl shadow-sm font-semibold h-11 text-xs sm:text-sm"
          >
            <Link href="/contas/nova">
              <Plus className="h-4 w-4 mr-1.5" />
              Nova Conta
            </Link>
          </Button>

          <Button
            asChild
            className="rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm h-11 text-xs sm:text-sm"
          >
            <Link href="/caixa/nova">
              <CircleDollarSign className="h-4 w-4 mr-1.5" />
              Nova Entrada
            </Link>
          </Button>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Contas Pendentes */}
          <KPICard
            title="Contas a Pagar"
            value={data?.kpis?.totalPendente || 0}
            subtitle={`${data?.kpis?.qtdPendentes || 0} contas aguardando pagamento`}
            icon={Clock}
            variant="warning"
          />

          {/* Contas Vencidas */}
          <KPICard
            title="Contas Vencidas"
            value={data?.kpis?.totalVencido || 0}
            subtitle={
              data?.kpis?.qtdVencidas > 0
                ? `Atenção: ${data.kpis.qtdVencidas} contas em atraso`
                : "Nenhuma conta vencida"
            }
            icon={AlertTriangle}
            variant={data?.kpis?.qtdVencidas > 0 ? "danger" : "default"}
          />

          {/* Entradas do Mês */}
          <KPICard
            title="Entradas do Mês"
            value={data?.kpis?.totalEntradasMes || 0}
            subtitle={`${data?.kpis?.qtdEntradasMes || 0} entradas registradas`}
            icon={TrendingUp}
            variant="success"
          />

          {/* Saldo Projetado */}
          <KPICard
            title="Saldo Projetado"
            value={data?.kpis?.saldoProjetado || 0}
            subtitle="Entradas do mês - Despesas totais"
            icon={Wallet}
            variant={
              (data?.kpis?.saldoProjetado || 0) >= 0 ? "info" : "danger"
            }
          />
        </div>
      )}

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 6 meses (2 colunas) */}
        <div className="lg:col-span-2">
          {loading ? (
            <Skeleton className="h-[360px] rounded-2xl" />
          ) : (
            <CashFlowChart data={data?.fluxo6Meses || []} />
          )}
        </div>

        {/* Distribuição por Categoria (1 coluna) */}
        <div className="lg:col-span-1">
          {loading ? (
            <Skeleton className="h-[360px] rounded-2xl" />
          ) : (
            <CategoryPieChart data={data?.categoriasChart || []} />
          )}
        </div>
      </div>

      {/* Upcoming Bills List (Full Width) */}
      <div>
        {loading ? (
          <Skeleton className="h-64 rounded-2xl" />
        ) : (
          <UpcomingBills
            contas={data?.proximasContas || []}
            onRefresh={fetchDashboardData}
          />
        )}
      </div>
    </div>
  );
}
