"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  // Obter título amigável baseado na rota
  const getPageTitle = () => {
    if (pathname === "/") return "Visão Geral";
    if (pathname.startsWith("/contas/nova")) return "Nova Conta a Pagar";
    if (pathname.startsWith("/contas/")) return "Detalhes da Conta";
    if (pathname.startsWith("/contas")) return "Contas a Pagar";
    if (pathname.startsWith("/caixa/nova")) return "Nova Entrada de Caixa";
    if (pathname.startsWith("/caixa")) return "Entrada de Caixa";
    if (pathname.startsWith("/relatorios")) return "Relatórios Financeiros";
    if (pathname.startsWith("/usuarios")) return "Gerenciar Usuários";
    if (pathname.startsWith("/configuracoes")) return "Configurações";
    return "Dona Vó Gestão";
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 border-b border-border bg-background/80 backdrop-blur-md transition-colors">
      {/* Mobile Brand / Page Title */}
      <div className="flex items-center gap-3">
        <Link href="/" className="lg:hidden flex items-center gap-2.5">
          <div className="relative h-9 w-9 rounded-xl overflow-hidden border border-brand-gold/40 shadow-xs shrink-0">
            <Image
              src="/logo-donavo.png"
              alt="Logo Dona Vó"
              fill
              className="object-cover"
            />
          </div>
        </Link>
        <div className="flex flex-col">
          <h1 className="text-base md:text-xl font-bold font-serif text-foreground tracking-tight line-clamp-1">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link href="/configuracoes" className="lg:hidden flex items-center">
          <Avatar className="h-8 w-8 border border-primary/20">
            <AvatarImage src={user?.avatar || ""} />
            <AvatarFallback className="text-[11px]">
              {user?.nome ? user.nome.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
