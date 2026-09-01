import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { changePasswordSchema } from "@/lib/validations/auth";

export async function PUT(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = changePasswordSchema.parse(body);

    const user = await prisma.usuario.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(validatedData.senhaAtual, user.senha);
    if (!isMatch) {
      return NextResponse.json({ error: "A senha atual informada está incorreta" }, { status: 400 });
    }

    const hashedNewPassword = await bcrypt.hash(validatedData.novaSenha, 10);

    await prisma.usuario.update({
      where: { id: session.user.id },
      data: { senha: hashedNewPassword },
    });

    return NextResponse.json({ message: "Senha alterada com sucesso!" });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao atualizar senha" }, { status: 500 });
  }
}
