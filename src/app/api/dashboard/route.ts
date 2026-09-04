import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, addDays } from "date-fns";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const hoje = new Date();
    const inicioMes = startOfMonth(hoje);
    const fimMes = endOfMonth(hoje);
    const em7Dias = addDays(hoje, 7);

    // ================================================================
    // Queries KPI em paralelo com Promise.all
    // ================================================================
    const [
      kpiPendentes,
      kpiVencidas,
      kpiEntradasMes,
      kpiPagoMes,
      kpiDespesasMes,
      proximasContas,
      contasPorCategoria,
    ] = await Promise.all([
      // 1. Agregação de pendentes
      prisma.conta.aggregate({
        where: { status: "PENDENTE", dataVencimento: { gte: hoje } },
        _sum: { valor: true },
        _count: true,
      }),

      // 2. Vencidas
      prisma.conta.aggregate({
        where: {
          OR: [
            { status: "VENCIDA" },
            { status: "PENDENTE", dataVencimento: { lt: hoje } },
          ],
        },
        _sum: { valor: true },
        _count: true,
      }),

      // 3. Entradas do mês - agregação
      prisma.entradaCaixa.aggregate({
        where: { dataEntrada: { gte: inicioMes, lte: fimMes } },
        _sum: { valor: true },
        _count: true,
      }),

      // 4. Total pago no mês - usar valorPago quando disponível
      prisma.conta.aggregate({
        where: { status: "PAGA", dataPagamento: { gte: inicioMes, lte: fimMes } },
        _sum: { valorPago: true, valor: true },
        _count: true,
      }),

      // 5. Total despesas do mês (vencimento no mês)
      prisma.conta.aggregate({
        where: { dataVencimento: { gte: inicioMes, lte: fimMes } },
        _sum: { valor: true },
      }),

      // 6. Próximas contas
      prisma.conta.findMany({
        where: {
          status: "PENDENTE",
          dataVencimento: { gte: hoje, lte: em7Dias },
        },
        select: {
          id: true,
          fornecedor: true,
          valor: true,
          dataVencimento: true,
          categoria: true,
          status: true,
          discriminacao: true,
        },
        orderBy: { dataVencimento: "asc" },
        take: 5,
      }),

      // 7. Categorias agrupadas
      prisma.conta.groupBy({
        by: ["categoria"],
        _sum: { valor: true },
        where: { status: { not: "CANCELADA" } },
      }),
    ]);

    // ================================================================
    // Fluxo 6 meses — Executado no PostgreSQL com mapeamento correto de tabelas
    // ================================================================
    const inicioJanela = startOfMonth(subMonths(hoje, 5));

    let entradasAgrupadas: { mes: Date; total: number }[] = [];
    let saidasAgrupadas: { mes: Date; total: number }[] = [];

    try {
      [entradasAgrupadas, saidasAgrupadas] = await Promise.all([
        prisma.$queryRaw<{ mes: Date; total: number }[]>`
          SELECT date_trunc('month', "dataEntrada") AS mes, SUM(valor)::float AS total
          FROM "entradas_caixa"
          WHERE "dataEntrada" >= ${inicioJanela} AND "dataEntrada" <= ${fimMes}
          GROUP BY mes
          ORDER BY mes ASC
        `,
        prisma.$queryRaw<{ mes: Date; total: number }[]>`
          SELECT date_trunc('month', "dataVencimento") AS mes, SUM(valor)::float AS total
          FROM "contas"
          WHERE "dataVencimento" >= ${inicioJanela} AND "dataVencimento" <= ${fimMes}
            AND status NOT IN ('CANCELADA')
          GROUP BY mes
          ORDER BY mes ASC
        `,
      ]);
    } catch (queryErr) {
      console.error("Erro na query de fluxo 6 meses:", queryErr);
    }

    const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const fluxo6Meses = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(hoje, 5 - i);
      const mesKey = startOfMonth(d).toISOString().slice(0, 7);
      const mesLabel = `${mesesNomes[d.getMonth()]}/${d.getFullYear().toString().slice(2)}`;

      const entrada = entradasAgrupadas.find((e) => {
        const eDate = new Date(e.mes);
        return eDate.toISOString().slice(0, 7) === mesKey;
      });
      const saida = saidasAgrupadas.find((s) => {
        const sDate = new Date(s.mes);
        return sDate.toISOString().slice(0, 7) === mesKey;
      });

      return {
        mes: mesLabel,
        entradas: Number(entrada?.total || 0),
        saidas: Number(saida?.total || 0),
      };
    });

    // Processar categorias
    const getCategoria = (nome: string) =>
      Number(contasPorCategoria.find((c) => c.categoria === nome)?._sum.valor || 0);

    const categoriasChart = [
      { name: "Custeio", value: getCategoria("CUSTEIO"), color: "#A83A1F" },
      { name: "Investimento", value: getCategoria("INVESTIMENTO"), color: "#D4A853" },
      { name: "Outras", value: getCategoria("OUTRAS"), color: "#5B8FA8" },
    ];

    const totalEntradasMes = Number(kpiEntradasMes._sum.valor || 0);
    const totalDespesasMes = Number(kpiDespesasMes._sum.valor || 0);

    return NextResponse.json({
      kpis: {
        totalPendente: Number(kpiPendentes._sum.valor || 0),
        qtdPendentes: kpiPendentes._count,
        totalVencido: Number(kpiVencidas._sum.valor || 0),
        qtdVencidas: kpiVencidas._count,
        totalEntradasMes,
        qtdEntradasMes: kpiEntradasMes._count,
        totalPagoMes: Number(kpiPagoMes._sum.valorPago || kpiPagoMes._sum.valor || 0),
        totalDespesasMes,
        saldoProjetado: totalEntradasMes - totalDespesasMes,
      },
      proximasContas,
      categoriasChart,
      fluxo6Meses,
    });
  } catch (error) {
    console.error("Erro na rota do Dashboard:", error);
    return NextResponse.json({ error: "Erro ao processar dados do dashboard" }, { status: 500 });
  }
}
