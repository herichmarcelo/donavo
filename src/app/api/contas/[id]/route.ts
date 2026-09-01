import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { contaSchema } from "@/lib/validations/conta";
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

    const conta = await prisma.conta.findUnique({
      where: { id: params.id },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true },
        },
      },
    });

    if (!conta) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
    }

    return NextResponse.json(conta);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar conta" }, { status: 500 });
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
    const validatedData = contaSchema.parse(body);

    const contaAtualizada = await prisma.conta.update({
      where: { id: params.id },
      data: {
        fornecedor: validatedData.fornecedor,
        valor: Number(validatedData.valor),
        discriminacao: validatedData.discriminacao,
        dataVencimento: parseISO(validatedData.dataVencimento),
        categoria: validatedData.categoria,
        observacao: validatedData.observacao,
      },
    });

    return NextResponse.json(contaAtualizada);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro ao atualizar conta" },
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

    await prisma.conta.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Conta excluída com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir conta" }, { status: 500 });
  }
}
