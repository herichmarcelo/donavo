"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ContaForm } from "@/components/contas/ContaForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditarContaPage() {
  const params = useParams();
  const id = params?.id as string;

  const [conta, setConta] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchConta() {
      try {
        setLoading(true);
        const res = await fetch(`/api/contas/${id}`);
        if (res.ok) {
          const data = await res.json();
          setConta(data);
        }
      } catch (error) {
        console.error("Erro ao buscar conta:", error);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      fetchConta();
    }
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
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
            Editar Conta a Pagar
          </h2>
          <p className="text-xs text-muted-foreground">
            Altere os dados cadastrais da despesa
          </p>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : conta ? (
        <ContaForm initialData={conta} isEditing={true} />
      ) : (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <p className="text-sm text-muted-foreground">Conta não encontrada.</p>
        </div>
      )}
    </div>
  );
}
