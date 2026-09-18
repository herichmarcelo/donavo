import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { entradaCaixaSchema } from "@/lib/validations/entrada";
import { parseISO } from "date-fns";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const entrada = await prisma.entradaCaixa.findUnique({
      where: { id: params.id },
    });

    if (!entrada) {
      return NextResponse.json({ error: "Entrada não encontrada" }, { status: 404 });
    }

    return NextResponse.json(entrada);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar entrada" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
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

    const entradaAtualizada = await prisma.entradaCaixa.update({
      where: { id: params.id },
      data: {
        descricao: validatedData.descricao,
        valorDinheiro,
        valorDebito,
        valorCredito,
        valorPix,
        valorVoucher,
        valorTotal,
        valor: valorTotal,
        dataEntrada: parseISO(validatedData.dataEntrada),
        tipo: validatedData.tipo || "VENDA",
        observacao: validatedData.observacao,
      },
    });

    return NextResponse.json(entradaAtualizada);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro ao atualizar entrada de caixa" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    await prisma.entradaCaixa.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Entrada excluída com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir entrada" }, { status: 500 });
  }
}
