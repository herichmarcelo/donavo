import * as React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { PagarContaSheet } from "@/components/contas/PagarContaSheet";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col antialiased">
      {/* Desktop Fixed Sidebar */}
      <Sidebar />

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300">
        {/* Top Header */}
        <Header />

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12 animate-fade-in">
          {children}
        </main>
      </div>

      {/* Mobile Navigation & Drawer */}
      <BottomNav />
      <MobileDrawer />

      {/* Global Quick Action: Pagar Conta Bottom Sheet */}
      <PagarContaSheet />
    </div>
  );
}
