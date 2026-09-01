import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      nome: string;
      cargo: string;
      avatar?: string | null;
      ativo: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    nome: string;
    cargo: string;
    avatar?: string | null;
    ativo: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    nome: string;
    cargo: string;
    avatar?: string | null;
    ativo: boolean;
  }
}
