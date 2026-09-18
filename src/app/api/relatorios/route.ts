import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfDay,
  endOfDay,
} from "date-fns";
import { formatDate } from "@/lib/formatters";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const nomesMeses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function parseDateParam(val: string | null): Date | null {
  if (!val) return null;
  const trimmed = val.trim();
  const brMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brMatch) {
    return new Date(parseInt(brMatch[3]), parseInt(brMatch[2]) - 1, parseInt(brMatch[1]));
  }
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const periodo = searchParams.get("periodo");
    const mes = searchParams.get("mes");
    const ano = searchParams.get("ano");
    const dataInicioParam = searchParams.get("dataInicio");
    const dataFimParam = searchParams.get("dataFim");
    const status = searchParams.get("status");
    const categoria = searchParams.get("categoria");
    const busca = searchParams.get("busca");

    let dataInicio: Date;
    let dataFim: Date;
    let periodoLabel = "";

    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const anoRef = ano ? parseInt(ano) : anoAtual;

    const parsedInicio = parseDateParam(dataInicioParam);
    const parsedFim = parseDateParam(dataFimParam);

    if (parsedInicio && parsedFim) {
      dataInicio = startOfDay(parsedInicio);
      dataFim = endOfDay(parsedFim);
      periodoLabel = `${formatDate(dataInicio)} a ${formatDate(dataFim)}`;
    } else if (periodo === "mes-atual") {
      dataInicio = startOfMonth(hoje);
      dataFim = endOfMonth(hoje);
      periodoLabel = `${nomesMeses[hoje.getMonth()]} de ${hoje.getFullYear()}`;
    } else if (periodo === "mes-anterior") {
      const d = subMonths(hoje, 1);
      dataInicio = startOfMonth(d);
      dataFim = endOfMonth(d);
      periodoLabel = `${nomesMeses[d.getMonth()]} de ${d.getFullYear()}`;
    } else if (periodo === "ultimos-3-meses") {
      const d = subMonths(hoje, 2);
      dataInicio = startOfMonth(d);
      dataFim = endOfMonth(hoje);
      periodoLabel = `${nomesMeses[d.getMonth()]}/${d.getFullYear()} a ${nomesMeses[hoje.getMonth()]}/${hoje.getFullYear()}`;
    } else if (periodo === "ano-todo" || (ano && mes === "todos")) {
      dataInicio = new Date(anoRef, 0, 1, 0, 0, 0);
      dataFim = new Date(anoRef, 11, 31, 23, 59, 59);
      periodoLabel = `Ano de ${anoRef}`;
    } else if (periodo === "fev-mar-abr-2026") {
      dataInicio = new Date(2026, 1, 1);
      dataFim = endOfMonth(new Date(2026, 3, 1));
      periodoLabel = "Fev, Mar e Abr de 2026";
    } else if (periodo === "maio-2026") {
      dataInicio = startOfMonth(new Date(2026, 4, 1));
      dataFim = endOfMonth(new Date(2026, 4, 1));
      periodoLabel = "Maio de 2026";
    } else if (periodo === "junho-2026") {
      dataInicio = startOfMonth(new Date(2026, 5, 1));
      dataFim = endOfMonth(new Date(2026, 5, 1));
      periodoLabel = "Junho de 2026";
    } else if (periodo === "julho-2026") {
      dataInicio = startOfMonth(new Date(2026, 6, 1));
      dataFim = endOfMonth(new Date(2026, 6, 1));
      periodoLabel = "Julho de 2026";
    } else if (mes && mes !== "todos") {
      const m = parseInt(mes) - 1;
      const d = new Date(anoRef, m, 1);
      dataInicio = startOfMonth(d);
      dataFim = endOfMonth(d);
      periodoLabel = `${nomesMeses[m]} de ${anoRef}`;
    } else if (ano) {
      dataInicio = new Date(anoRef, 0, 1, 0, 0, 0);
      dataFim = new Date(anoRef, 11, 31, 23, 59, 59);
      periodoLabel = `Ano de ${anoRef}`;
    } else {
      // Default: mês atual
      dataInicio = startOfMonth(hoje);
      dataFim = endOfMonth(hoje);
      periodoLabel = `${nomesMeses[hoje.getMonth()]} de ${hoje.getFullYear()}`;
    }

    const where: any = {
      dataVencimento: {
        gte: dataInicio,
        lte: dataFim,
      },
    };

    if (categoria && categoria !== "TODAS") {
      where.categoria = categoria;
    }

    if (status && status !== "TODOS") {
      if (status === "PENDENTE_OU_VENCIDA") {
        where.OR = [{ status: "PENDENTE" }, { status: "VENCIDA" }];
      } else {
        where.status = status;
      }
    }

    if (busca && busca.trim() !== "") {
      const termo = busca.trim();
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { fornecedor: { contains: termo, mode: "insensitive" } },
            { discriminacao: { contains: termo, mode: "insensitive" } },
            { observacao: { contains: termo, mode: "insensitive" } },
          ],
        },
      ];
    }

    const [contas, entradasAgg] = await Promise.all([
      prisma.conta.findMany({
        where,
        orderBy: { dataVencimento: "asc" },
        include: {
          usuario: { select: { nome: true } },
        },
      }),
      prisma.entradaCaixa.aggregate({
        where: {
          dataEntrada: {
            gte: dataInicio,
            lte: dataFim,
          },
        },
        _sum: { valorTotal: true, valor: true },
        _count: true,
      }),
    ]);

    // 1. Resumo Geral
    const totalGeral = contas.reduce((acc, c) => acc + Number(c.valor), 0);
    const totalPago = contas
      .filter((c) => c.status === "PAGA")
      .reduce((acc, c) => acc + Number(c.valorPago || c.valor), 0);
    const totalPendente = contas
      .filter((c) => c.status === "PENDENTE" || c.status === "VENCIDA")
      .reduce((acc, c) => acc + Number(c.valor), 0);
    const diferenca = totalGeral - totalPago;

    // 2. Agrupamento por Fornecedor
    const fornecedorMap = new Map<
      string,
      {
        fornecedor: string;
        total: number;
        totalPago: number;
        totalPendente: number;
        qtdContas: number;
      }
    >();

    contas.forEach((c) => {
      const nome = c.fornecedor.trim();
      const valor = Number(c.valor);
      const valorPago = c.status === "PAGA" ? Number(c.valorPago || c.valor) : 0;
      const valorPendente = c.status !== "PAGA" ? valor : 0;

      if (!fornecedorMap.has(nome)) {
        fornecedorMap.set(nome, {
          fornecedor: nome,
          total: valor,
          totalPago: valorPago,
          totalPendente: valorPendente,
          qtdContas: 1,
        });
      } else {
        const item = fornecedorMap.get(nome)!;
        item.total += valor;
        item.totalPago += valorPago;
        item.totalPendente += valorPendente;
        item.qtdContas += 1;
      }
    });

    const porFornecedor = Array.from(fornecedorMap.values()).sort(
      (a, b) => b.total - a.total
    );

    // 3. Agrupamento por Categoria
    const categoriaMap = new Map<
      string,
      { categoria: string; total: number; totalPago: number; qtdContas: number }
    >();

    contas.forEach((c) => {
      const cat = c.categoria;
      const valor = Number(c.valor);
      const valorPago = c.status === "PAGA" ? Number(c.valorPago || c.valor) : 0;

      if (!categoriaMap.has(cat)) {
        categoriaMap.set(cat, {
          categoria: cat,
          total: valor,
          totalPago: valorPago,
          qtdContas: 1,
        });
      } else {
        const item = categoriaMap.get(cat)!;
        item.total += valor;
        item.totalPago += valorPago;
        item.qtdContas += 1;
      }
    });

    const porCategoria = Array.from(categoriaMap.values());

    const totalReceitas = Number(
      entradasAgg._sum.valorTotal ?? entradasAgg._sum.valor ?? 0
    );
    const saldoLiquido = totalReceitas - totalPago;

    return NextResponse.json({
      periodoLabel,
      dataInicio: dataInicio.toISOString(),
      dataFim: dataFim.toISOString(),
      contas,
      resumo: {
        totalGeral,
        totalPago,
        totalPendente,
        diferenca,
        totalContas: contas.length,
        totalReceitas,
        saldoLiquido,
        qtdEntradas: entradasAgg._count,
      },
      porFornecedor,
      porCategoria,
    });
  } catch (error) {
    console.error("Erro na rota de relatórios:", error);
    return NextResponse.json(
      { error: "Erro ao gerar relatório financeiro" },
      { status: 500 }
    );
  }
}
