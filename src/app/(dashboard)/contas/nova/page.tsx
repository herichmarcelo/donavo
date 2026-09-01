"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContaForm } from "@/components/contas/ContaForm";
import { Button } from "@/components/ui/button";

export default function NovaContaPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      {/* Header com botão Voltar */}
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground"
        >
          <Link href="/contas">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground">
            Cadastrar Conta a Pagar
          </h2>
          <p className="text-xs text-muted-foreground">
            Preencha os dados do fornecedor, valor e vencimento
          </p>
        </div>
      </div>

      <ContaForm />
    </div>
  );
}
