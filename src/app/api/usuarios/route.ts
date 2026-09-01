import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { usuarioSchema } from "@/lib/validations/usuario";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session || session.user?.cargo !== "admin") {
      return NextResponse.json({ error: "Acesso restrito para administradores" }, { status: 403 });
    }

    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        ativo: true,
        avatar: true,
        ultimoAcesso: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || session.user?.cargo !== "admin") {
      return NextResponse.json({ error: "Acesso restrito para administradores" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = usuarioSchema.parse(body);

    if (!validatedData.senha) {
      return NextResponse.json({ error: "A senha é obrigatória para novos usuários" }, { status: 400 });
    }

    const email = validatedData.email.toLowerCase().trim();

    const existingUser = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Já existe um usuário cadastrado com este e-mail" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(validatedData.senha, 10);

    // 1. Criar no Supabase Authentication também (opcional / se chave de service role estiver configurada)
    let supabaseUserId: string | null = null;
    try {
      const { data: sbUser, error: sbError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: validatedData.senha,
        email_confirm: true,
        user_metadata: {
          nome: validatedData.nome,
          cargo: validatedData.cargo,
        },
      });
      if (!sbError && sbUser?.user) {
        supabaseUserId = sbUser.user.id;
      }
    } catch (sbErr) {
      console.warn("Supabase Auth admin create user ignorado:", sbErr);
    }

    // 2. Criar no banco de dados PostgreSQL
    const novoUsuario = await prisma.usuario.create({
      data: {
        id: supabaseUserId || undefined,
        nome: validatedData.nome,
        email,
        senha: hashedPassword,
        cargo: validatedData.cargo,
        ativo: validatedData.ativo,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        ativo: true,
        createdAt: true,
      },
    });

    return NextResponse.json(novoUsuario, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao cadastrar usuário" }, { status: 500 });
  }
}
