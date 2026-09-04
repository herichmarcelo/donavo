import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    let dataInicio: Date;
    let dataFim: Date;
    const anoRef = ano ? parseInt(ano) : 2026;

    if (periodo === "fev-mar-abr-2026") {
      dataInicio = new Date(anoRef, 1, 1);
      dataFim = endOfMonth(new Date(anoRef, 3, 1));
    } else if (periodo === "maio-2026") {
      dataInicio = startOfMonth(new Date(anoRef, 4, 1));
      dataFim = endOfMonth(new Date(anoRef, 4, 1));
    } else if (periodo === "junho-2026") {
      dataInicio = startOfMonth(new Date(anoRef, 5, 1));
      dataFim = endOfMonth(new Date(anoRef, 5, 1));
    } else if (periodo === "julho-2026") {
      dataInicio = startOfMonth(new Date(anoRef, 6, 1));
      dataFim = endOfMonth(new Date(anoRef, 6, 1));
    } else if (mes && ano) {
      const d = new Date(parseInt(ano), parseInt(mes) - 1, 1);
      dataInicio = startOfMonth(d);
      dataFim = endOfMonth(d);
    } else {
      const d = new Date(anoRef, 6, 1);
      dataInicio = startOfMonth(d);
      dataFim = endOfMonth(d);
    }

    const contas = await prisma.conta.findMany({
      where: {
        dataVencimento: {
          gte: dataInicio,
          lte: dataFim,
        },
      },
      orderBy: { dataVencimento: "asc" },
      include: {
        usuario: { select: { nome: true } },
      },
    });

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

    return NextResponse.json({
      contas,
      resumo: {
        totalGeral,
        totalPago,
        totalPendente,
        diferenca,
        totalContas: contas.length,
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
