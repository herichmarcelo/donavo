"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EntradaForm } from "@/components/caixa/EntradaForm";
import { Button } from "@/components/ui/button";

export default function NovaEntradaPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground"
        >
          <Link href="/caixa">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground">
            Registrar Entrada de Caixa
          </h2>
          <p className="text-xs text-muted-foreground">
            Lançamento de receitas e vendas com divisão por forma de pagamento
          </p>
        </div>
      </div>

      <EntradaForm />
    </div>
  );
}
