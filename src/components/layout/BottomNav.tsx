"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  CircleDollarSign,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";

export function BottomNav() {
  const pathname = usePathname();
  const { toggleSidebar, sidebarOpen } = useUIStore();

  const items = [
    {
      name: "Início",
      href: "/",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      name: "Contas",
      href: "/contas",
      icon: Receipt,
      active: pathname.startsWith("/contas"),
    },
    {
      name: "Caixa",
      href: "/caixa",
      icon: CircleDollarSign,
      active: pathname.startsWith("/caixa"),
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]">
      <nav className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] py-1 transition-all duration-200 active:scale-90",
                item.active
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "relative flex items-center justify-center p-1 rounded-full transition-colors",
                  item.active && "bg-primary/10"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    item.active && "scale-110"
                  )}
                />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* Botão Menu / Mais (Abre Drawer Mobile) */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Abrir Menu Completo"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] py-1 transition-all duration-200 active:scale-90",
            sidebarOpen
              ? "text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div
            className={cn(
              "relative flex items-center justify-center p-1 rounded-full transition-colors",
              sidebarOpen && "bg-primary/10"
            )}
          >
            <Menu className="h-5 w-5" />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">Mais</span>
        </button>
      </nav>
    </div>
  );
}
