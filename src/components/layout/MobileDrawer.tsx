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
  X,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function MobileDrawer() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { data: session } = useSession();

  const user = session?.user;
  const isAdmin = user?.cargo === "admin";

  const navigation = [
    {
      name: "Dashboard Inicial",
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
      name: "Relatórios Financeiros",
      href: "/relatorios",
      icon: FileSpreadsheet,
      active: pathname.startsWith("/relatorios"),
    },
    ...(isAdmin
      ? [
          {
            name: "Gerenciar Usuários",
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
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent side="bottom" className="lg:hidden rounded-t-3xl p-6 pb-8 bg-card border-t border-border">
        {/* Header do Drawer */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-xl overflow-hidden border border-brand-gold/40 shadow-sm shrink-0">
              <Image
                src="/logo-donavo.png"
                alt="Logo Dona Vó"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-primary leading-none">
                Dona Vó Gestão
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                Menu e Navegação
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Links de navegação */}
        <div className="py-4 space-y-1.5 max-h-[50vh] overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-colors min-h-[48px]",
                  item.active
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "text-foreground hover:bg-muted active:bg-muted/80"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      item.active ? "text-primary-foreground" : "text-primary"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </Link>
            );
          })}
        </div>

        {/* Informações do Usuário e Logout */}
        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatar || ""} />
                <AvatarFallback>
                  {user?.nome ? user.nome.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {user?.nome || "Usuário"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                  {user?.email}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px] uppercase">
              {user?.cargo || "operador"}
            </Badge>
          </div>

          <Button
            variant="destructive"
            size="default"
            onClick={() => {
              setSidebarOpen(false);
              signOut({ callbackUrl: "/login" });
            }}
            className="w-full flex items-center justify-center gap-2 text-sm rounded-xl min-h-[44px]"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair do Aplicativo</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
