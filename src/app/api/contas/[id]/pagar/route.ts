import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pagarContaSchema } from "@/lib/validations/conta";
import { parseISO } from "date-fns";
import { getMockContas } from "@/lib/mockData";

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

    try {
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
    } catch (dbErr) {
      console.warn("Atualizando pagamento no mock store:", dbErr);
      const mockContas = getMockContas();
      const idx = mockContas.findIndex((c) => c.id === params.id);
      if (idx !== -1) {
        mockContas[idx].status = "PAGA";
        mockContas[idx].dataPagamento = parseISO(validatedData.dataPagamento);
        mockContas[idx].valorPago = Number(validatedData.valorPago);
        if (validatedData.observacao) {
          mockContas[idx].observacao = validatedData.observacao;
        }
        return NextResponse.json({
          message: "Conta marcada como paga com sucesso!",
          conta: mockContas[idx],
        });
      }
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
    }
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro ao registrar pagamento da conta" },
      { status: 500 }
    );
  }
}
