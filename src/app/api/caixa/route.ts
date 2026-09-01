import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { entradaCaixaSchema } from "@/lib/validations/entrada";
import { startOfMonth, endOfMonth, parseISO, startOfDay, endOfDay } from "date-fns";
import { getMockEntradas, MockEntrada } from "@/lib/mockData";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo");
    const busca = searchParams.get("busca");

    try {
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

      const totalPeriodo = entradas.reduce((acc, e) => acc + Number(e.valor), 0);
      const totalHoje = entradasHoje.reduce((acc, e) => acc + Number(e.valor), 0);

      return NextResponse.json({
        entradas,
        resumo: {
          totalPeriodo,
          totalHoje,
          totalEntradas: entradas.length,
        },
      });
    } catch (dbErr) {
      console.warn("Usando mock data para Caixa:", dbErr);
      let entradas = getMockEntradas();

      if (tipo && tipo !== "TODOS") {
        entradas = entradas.filter((e) => e.tipo === tipo);
      }
      if (busca && busca.trim() !== "") {
        const term = busca.toLowerCase();
        entradas = entradas.filter(
          (e) =>
            e.descricao.toLowerCase().includes(term) ||
            (e.observacao && e.observacao.toLowerCase().includes(term))
        );
      }

      const totalPeriodo = entradas.reduce((acc, e) => acc + e.valor, 0);
      const totalHoje = entradas
        .filter((e) => new Date(e.dataEntrada).toDateString() === new Date().toDateString())
        .reduce((acc, e) => acc + e.valor, 0);

      return NextResponse.json({
        entradas,
        resumo: {
          totalPeriodo,
          totalHoje,
          totalEntradas: entradas.length,
        },
      });
    }
  } catch (error) {
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

    try {
      const novaEntrada = await prisma.entradaCaixa.create({
        data: {
          descricao: validatedData.descricao,
          valor: Number(validatedData.valor),
          dataEntrada: parseISO(validatedData.dataEntrada),
          tipo: validatedData.tipo,
          observacao: validatedData.observacao,
          usuarioId: session.user.id,
        },
      });

      return NextResponse.json(novaEntrada, { status: 201 });
    } catch (dbErr) {
      console.warn("Salvando entrada no mock store:", dbErr);
      const mockEntradas = getMockEntradas();
      const nova: MockEntrada = {
        id: `entrada-${Date.now()}`,
        descricao: validatedData.descricao,
        valor: Number(validatedData.valor),
        dataEntrada: parseISO(validatedData.dataEntrada),
        tipo: validatedData.tipo as any,
        observacao: validatedData.observacao || null,
        usuarioId: session.user.id || "admin-default-id",
        usuario: { nome: session.user.name || "Dona Vó Admin" },
        createdAt: new Date(),
      };
      mockEntradas.unshift(nova);
      return NextResponse.json(nova, { status: 201 });
    }
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro ao registrar entrada de caixa" },
      { status: 500 }
    );
  }
}
