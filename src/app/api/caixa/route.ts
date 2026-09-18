import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { entradaCaixaSchema } from "@/lib/validations/entrada";
import { startOfDay, endOfDay } from "date-fns";
import { parseDateSafe } from "@/lib/formatters";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo");
    const busca = searchParams.get("busca");

    const where: any = {};
    if (tipo && tipo !== "TODOS") {
      where.tipo = tipo;
    }
    if (busca && busca.trim() !== "") {
      where.OR = [
        { descricao: { contains: busca.trim(), mode: "insensitive" } },
        { observacao: { contains: busca.trim(), mode: "insensitive" } },
      ];
    }

    const entradas = await prisma.entradaCaixa.findMany({
      where,
      orderBy: { dataEntrada: "desc" },
      include: {
        usuario: { select: { id: true, nome: true } },
      },
    });

    const hoje = new Date();
    const entradasHoje = await prisma.entradaCaixa.findMany({
      where: {
        dataEntrada: {
          gte: startOfDay(hoje),
          lte: endOfDay(hoje),
        },
      },
    });

    const totalPeriodo = entradas.reduce(
      (acc, e) => acc + Number(e.valorTotal ?? e.valor ?? 0),
      0
    );
    const totalHoje = entradasHoje.reduce(
      (acc, e) => acc + Number(e.valorTotal ?? e.valor ?? 0),
      0
    );

    return NextResponse.json({
      entradas,
      resumo: {
        totalPeriodo,
        totalHoje,
        totalEntradas: entradas.length,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar entradas de caixa:", error);
    return NextResponse.json(
      { error: "Erro ao buscar entradas de caixa" },
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
    const validatedData = entradaCaixaSchema.parse(body);

    const valorDinheiro = Number(validatedData.valorDinheiro) || 0;
    const valorDebito = Number(validatedData.valorDebito) || 0;
    const valorCredito = Number(validatedData.valorCredito) || 0;
    const valorPix = Number(validatedData.valorPix) || 0;
    const valorVoucher = Number(validatedData.valorVoucher) || 0;
    const valorTotal =
      valorDinheiro + valorDebito + valorCredito + valorPix + valorVoucher;

    const novaEntrada = await prisma.entradaCaixa.create({
      data: {
        descricao: validatedData.descricao,
        valorDinheiro,
        valorDebito,
        valorCredito,
        valorPix,
        valorVoucher,
        valorTotal,
        valor: valorTotal,
        dataEntrada: parseDateSafe(validatedData.dataEntrada) || new Date(),
        tipo: validatedData.tipo || "VENDA",
        observacao: validatedData.observacao,
        usuarioId: session.user.id,
      },
    });

    return NextResponse.json(novaEntrada, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Erro ao registrar entrada de caixa:", error);
    return NextResponse.json(
      { error: "Erro ao registrar entrada de caixa" },
      { status: 500 }
    );
  }
}
