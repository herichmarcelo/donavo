import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { usuarioSchema } from "@/lib/validations/usuario";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session || session.user?.cargo !== "admin") {
      return NextResponse.json({ error: "Acesso restrito para administradores" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = usuarioSchema.parse(body);

    const updateData: any = {
      nome: validatedData.nome,
      email: validatedData.email.toLowerCase().trim(),
      cargo: validatedData.cargo,
      ativo: validatedData.ativo,
    };

    if (validatedData.senha && validatedData.senha.trim() !== "") {
      updateData.senha = await bcrypt.hash(validatedData.senha, 10);
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        ativo: true,
        avatar: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(usuarioAtualizado);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session || session.user?.cargo !== "admin") {
      return NextResponse.json({ error: "Acesso restrito para administradores" }, { status: 403 });
    }

    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: "Você não pode excluir sua própria conta de administrador" },
        { status: 400 }
      );
    }

    await prisma.usuario.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Usuário excluído com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir usuário" }, { status: 500 });
  }
}
