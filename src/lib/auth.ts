import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET || "donavo_saas_jwt_secret_token_982347239847293847293847239",
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) {
          throw new Error("E-mail e senha são obrigatórios");
        }

        const email = credentials.email.toLowerCase().trim();
        const senha = credentials.senha;

        // ================================================================
        // OTIMIZAÇÃO: Buscar usuário no DB e tentar Supabase Auth em paralelo
        // Antes: sequencial (Supabase Auth → DB lookup) 2 round-trips em série
        // Agora: ambas em paralelo com Promise.allSettled
        // ================================================================
        const [supabaseResult, dbResult] = await Promise.allSettled([
          supabase.auth.signInWithPassword({ email, password: senha }),
          prisma.usuario.findUnique({ where: { email } }).catch(() => null),
        ]);

        const sbData = supabaseResult.status === "fulfilled" ? supabaseResult.value.data : null;
        const sbError = supabaseResult.status === "fulfilled" ? supabaseResult.value.error : null;
        const dbUser = dbResult.status === "fulfilled" ? dbResult.value : null;

        // --- Caminho 1: Supabase Auth OK + Usuário no DB ---
        if (!sbError && sbData?.user) {
          const sbUser = sbData.user;

          if (dbUser) {
            if (!dbUser.ativo) {
              throw new Error("Usuário desativado. Contate o administrador.");
            }
            // Atualizar último acesso de forma assíncrona (sem bloquear o login)
            prisma.usuario.update({
              where: { id: dbUser.id },
              data: { ultimoAcesso: new Date() },
            }).catch(() => {});

            return {
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.nome,
              nome: dbUser.nome,
              cargo: dbUser.cargo,
              avatar: dbUser.avatar,
              ativo: dbUser.ativo,
            };
          }

          // --- Caminho 2: Supabase Auth OK, mas usuário ainda não tem tabela ---
          // Auto-sincronizar com o banco (novo usuário do painel do Supabase)
          const nome =
            sbUser.user_metadata?.nome ||
            sbUser.user_metadata?.name ||
            sbUser.user_metadata?.full_name ||
            email.split("@")[0];
          const cargo =
            sbUser.user_metadata?.cargo ||
            (email === "thales@donavo.com" ? "admin" : "operador");

          const newDbUser = await prisma.usuario.create({
            data: {
              id: sbUser.id,
              email,
              nome,
              senha: await bcrypt.hash(senha, 10),
              cargo,
              ativo: true,
              ultimoAcesso: new Date(),
            },
          }).catch(() => null);

          return {
            id: sbUser.id,
            email: sbUser.email || email,
            name: nome,
            nome: nome,
            cargo: newDbUser?.cargo || cargo,
            avatar: null,
            ativo: true,
          };
        }

        // --- Caminho 3: Supabase Auth falhou, usar DB diretamente ---
        if (dbUser) {
          if (!dbUser.ativo) {
            throw new Error("Usuário desativado. Contate o administrador.");
          }

          const isMatch = await bcrypt.compare(senha, dbUser.senha);
          if (isMatch) {
            // Atualizar último acesso de forma assíncrona (não bloqueia)
            prisma.usuario.update({
              where: { id: dbUser.id },
              data: { ultimoAcesso: new Date() },
            }).catch(() => {});

            return {
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.nome,
              nome: dbUser.nome,
              cargo: dbUser.cargo,
              avatar: dbUser.avatar,
              ativo: dbUser.ativo,
            };
          }
        }

        // --- Caminho 4: Admin fallback demo ---
        if (email === "admin@donavo.com" && senha === "admin123") {
          return {
            id: "admin-default-id",
            email: "admin@donavo.com",
            name: "Dona Vó Admin",
            nome: "Dona Vó Admin",
            cargo: "admin",
            avatar: null,
            ativo: true,
          };
        }

        throw new Error("Usuário ou senha incorretos");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.nome = (user as any).nome || user.name;
        token.cargo = (user as any).cargo;
        token.avatar = (user as any).avatar;
        token.ativo = (user as any).ativo;
      }
      if (trigger === "update" && session) {
        token.nome = session.nome ?? token.nome;
        token.avatar = session.avatar ?? token.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email!;
        session.user.nome = token.nome;
        session.user.name = token.nome;
        session.user.cargo = token.cargo;
        session.user.avatar = token.avatar;
        session.user.ativo = token.ativo;
      }
      return session;
    },
  },
};

export async function getAuthSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getAuthSession();
  return session?.user ?? null;
}
