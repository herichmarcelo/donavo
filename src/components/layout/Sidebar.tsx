"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Receipt,
  CircleDollarSign,
  FileSpreadsheet,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user;
  const isAdmin = user?.cargo === "admin";

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      name: "Contas a Pagar",
      href: "/contas",
      icon: Receipt,
      active: pathname.startsWith("/contas"),
    },
    {
      name: "Entrada de Caixa",
      href: "/caixa",
      icon: CircleDollarSign,
      active: pathname.startsWith("/caixa"),
    },
    {
      name: "Relatórios",
      href: "/relatorios",
      icon: FileSpreadsheet,
      active: pathname.startsWith("/relatorios"),
    },
    ...(isAdmin
      ? [
          {
            name: "Usuários",
            href: "/usuarios",
            icon: Users,
            active: pathname.startsWith("/usuarios"),
          },
        ]
      : []),
    {
      name: "Configurações",
      href: "/configuracoes",
      icon: Settings,
      active: pathname.startsWith("/configuracoes"),
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 border-r border-border bg-card/95 backdrop-blur-md z-40 transition-all duration-300">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-border">
        <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-brand-gold/40 shadow-sm shrink-0 bg-brand-warmWhite">
          <Image
            src="/logo-donavo.png"
            alt="Logo Dona Vó"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="font-serif text-lg font-bold text-primary tracking-tight leading-none">
            Dona Vó
          </span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-1">
            Gestão Financeira
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Menu Principal
        </div>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px]",
                item.active
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                  item.active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                )}
              />
              <span className="flex-1 truncate">{item.name}</span>
              {item.active && (
                <ChevronRight className="h-4 w-4 opacity-70 ml-auto" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User & Footer */}
      <div className="p-4 border-t border-border bg-muted/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Avatar className="h-9 w-9 border border-primary/20">
              <AvatarImage src={user?.avatar || ""} />
              <AvatarFallback>
                {user?.nome ? user.nome.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold truncate text-foreground">
                {user?.nome || "Usuário"}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Badge
                  variant={isAdmin ? "default" : "secondary"}
                  className="text-[10px] px-1.5 py-0 uppercase font-medium h-4"
                >
                  {user?.cargo || "operador"}
                </Badge>
              </div>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 h-9"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sair da conta</span>
        </Button>
      </div>
    </aside>
  );
}
