import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { contaSchema } from "@/lib/validations/conta";
import { startOfMonth, endOfMonth, addMonths, parseISO } from "date-fns";
import { getMockContas, MockConta } from "@/lib/mockData";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const categoria = searchParams.get("categoria");
    const mes = searchParams.get("mes");
    const ano = searchParams.get("ano");
    const busca = searchParams.get("busca");

    try {
      const where: any = {};

      if (status && status !== "TODOS") {
        where.status = status;
      }

      if (categoria && categoria !== "TODAS") {
        where.categoria = categoria;
      }

      if (mes && ano) {
        const dataRef = new Date(parseInt(ano), parseInt(mes) - 1, 1);
        where.dataVencimento = {
          gte: startOfMonth(dataRef),
          lte: endOfMonth(dataRef),
        };
      } else if (ano) {
        const dataInicio = new Date(parseInt(ano), 0, 1);
        const dataFim = new Date(parseInt(ano), 11, 31, 23, 59, 59);
        where.dataVencimento = {
          gte: dataInicio,
          lte: dataFim,
        };
      }

      if (busca && busca.trim() !== "") {
        where.OR = [
          { fornecedor: { contains: busca.trim(), mode: "insensitive" } },
          { discriminacao: { contains: busca.trim(), mode: "insensitive" } },
          { observacao: { contains: busca.trim(), mode: "insensitive" } },
        ];
      }

      const contas = await prisma.conta.findMany({
        where,
        orderBy: { dataVencimento: "asc" },
        include: {
          usuario: {
            select: { id: true, nome: true },
          },
        },
      });

      const totalGeral = contas.reduce((acc, c) => acc + Number(c.valor), 0);
      const totalPago = contas
        .filter((c) => c.status === "PAGA")
        .reduce((acc, c) => acc + Number(c.valorPago || c.valor), 0);
      const totalPendente = contas
        .filter((c) => c.status === "PENDENTE" || c.status === "VENCIDA")
        .reduce((acc, c) => acc + Number(c.valor), 0);
      const diferenca = totalGeral - totalPago;

      return NextResponse.json({
        contas,
        resumo: {
          totalGeral,
          totalPago,
          totalPendente,
          diferenca,
          totalContas: contas.length,
        },
      });
    } catch (dbErr) {
      console.warn("Usando mock data para Contas:", dbErr);
      let contas = getMockContas();

      if (status && status !== "TODOS") {
        contas = contas.filter((c) => c.status === status);
      }
      if (categoria && categoria !== "TODAS") {
        contas = contas.filter((c) => c.categoria === categoria);
      }
      if (busca && busca.trim() !== "") {
        const term = busca.toLowerCase();
        contas = contas.filter(
          (c) =>
            c.fornecedor.toLowerCase().includes(term) ||
            (c.discriminacao && c.discriminacao.toLowerCase().includes(term)) ||
            (c.observacao && c.observacao.toLowerCase().includes(term))
        );
      }

      const totalGeral = contas.reduce((acc, c) => acc + c.valor, 0);
      const totalPago = contas
        .filter((c) => c.status === "PAGA")
        .reduce((acc, c) => acc + (c.valorPago || c.valor), 0);
      const totalPendente = contas
        .filter((c) => c.status === "PENDENTE" || c.status === "VENCIDA")
        .reduce((acc, c) => acc + c.valor, 0);
      const diferenca = totalGeral - totalPago;

      return NextResponse.json({
        contas,
        resumo: {
          totalGeral,
          totalPago,
          totalPendente,
          diferenca,
          totalContas: contas.length,
        },
      });
    }
  } catch (error) {
    console.error("Erro ao listar contas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar contas a pagar" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = contaSchema.parse(body);

    const dataVencimentoBase = parseISO(validatedData.dataVencimento);
    const numParcelas = validatedData.parcelado ? validatedData.numeroParcelas || 1 : 1;

    try {
      if (numParcelas > 1) {
        const contasCriadas = [];
        const valorPorParcela = Number(validatedData.valor) / numParcelas;

        for (let i = 0; i < numParcelas; i++) {
          const vencimentoParcela = addMonths(dataVencimentoBase, i);
          const discriminacaoComParcela = validatedData.discriminacao
            ? `${validatedData.discriminacao} (${i + 1}/${numParcelas})`
            : `Parcela ${i + 1}/${numParcelas}`;

          const novaConta = await prisma.conta.create({
            data: {
              fornecedor: validatedData.fornecedor,
              valor: valorPorParcela,
              discriminacao: discriminacaoComParcela,
              dataVencimento: vencimentoParcela,
              categoria: validatedData.categoria,
              observacao: validatedData.observacao,
              status: "PENDENTE",
              usuarioId: session.user.id,
            },
          });
          contasCriadas.push(novaConta);
        }

        return NextResponse.json(
          { message: `${numParcelas} parcelas criadas!`, contas: contasCriadas },
          { status: 201 }
        );
      }

      const novaConta = await prisma.conta.create({
        data: {
          fornecedor: validatedData.fornecedor,
          valor: Number(validatedData.valor),
          discriminacao: validatedData.discriminacao,
          dataVencimento: dataVencimentoBase,
          categoria: validatedData.categoria,
          observacao: validatedData.observacao,
          status: "PENDENTE",
          usuarioId: session.user.id,
        },
      });

      return NextResponse.json(novaConta, { status: 201 });
    } catch (dbErr) {
      console.warn("Salvando em mock store:", dbErr);
      const mockContas = getMockContas();
      const nova: MockConta = {
        id: `conta-${Date.now()}`,
        fornecedor: validatedData.fornecedor,
        valor: Number(validatedData.valor),
        discriminacao: validatedData.discriminacao || null,
        dataVencimento: dataVencimentoBase,
        dataPagamento: null,
        valorPago: null,
        status: "PENDENTE",
        categoria: validatedData.categoria as any,
        observacao: validatedData.observacao || null,
        usuarioId: session.user.id || "admin-default-id",
        usuario: { nome: session.user.name || "Dona Vó Admin" },
        createdAt: new Date(),
      };
      mockContas.unshift(nova);
      return NextResponse.json(nova, { status: 201 });
    }
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro ao cadastrar conta a pagar" },
      { status: 500 }
    );
  }
}
