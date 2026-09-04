import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pagarContaSchema } from "@/lib/validations/conta";
import { parseISO } from "date-fns";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = pagarContaSchema.parse(body);

    const conta = await prisma.conta.update({
      where: { id: params.id },
      data: {
        status: "PAGA",
        dataPagamento: parseISO(validatedData.dataPagamento),
        valorPago: Number(validatedData.valorPago),
        observacao: validatedData.observacao || undefined,
      },
    });

    return NextResponse.json({
      message: "Conta marcada como paga com sucesso!",
      conta,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Erro ao registrar pagamento da conta:", error);
    return NextResponse.json(
      { error: "Erro ao registrar pagamento da conta" },
      { status: 500 }
    );
  }
}
