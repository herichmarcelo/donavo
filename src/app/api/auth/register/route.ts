import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    const email = validatedData.email.toLowerCase().trim();

    // 1. Verificar se usuário já existe
    const existing = await prisma.usuario.findUnique({
      where: { email },
    }).catch(() => null);

    if (existing) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado. Faça login ou recupere sua senha." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(validatedData.senha, 10);

    // Contar usuários para definir se é o primeiro admin
    const totalUsers = await prisma.usuario.count().catch(() => 0);
    const cargo = totalUsers === 0 || email.includes("admin") || email === "thales@donavo.com" ? "admin" : "operador";

    // 2. Criar no Supabase Auth também (se configurado)
    let supabaseUserId: string | null = null;
    try {
      const { data: sbUser, error: sbError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: validatedData.senha,
        email_confirm: true,
        user_metadata: {
          nome: validatedData.nome,
          cargo,
        },
      });
      if (!sbError && sbUser?.user) {
        supabaseUserId = sbUser.user.id;
      }
    } catch (sbErr) {
      console.warn("Supabase Auth admin create user ignorado:", sbErr);
    }

    // 3. Criar na tabela do PostgreSQL
    const novoUsuario = await prisma.usuario.create({
      data: {
        id: supabaseUserId || undefined,
        nome: validatedData.nome,
        email,
        senha: hashedPassword,
        cargo,
        ativo: true,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
      },
    });

    return NextResponse.json(
      {
        message: "Conta e senha criadas com sucesso!",
        usuario: novoUsuario,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erro no registro:", error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro ao cadastrar usuário e senha" },
      { status: 500 }
    );
  }
}
