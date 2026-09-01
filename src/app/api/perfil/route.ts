import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { nome, avatar } = await req.json();

    if (!nome || nome.trim().length < 2) {
      return NextResponse.json({ error: "O nome deve ter ao menos 2 caracteres" }, { status: 400 });
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: session.user.id },
      data: {
        nome: nome.trim(),
        avatar: avatar || null,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        avatar: true,
      },
    });

    return NextResponse.json(usuarioAtualizado);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 });
  }
}
