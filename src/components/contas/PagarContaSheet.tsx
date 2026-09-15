"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2, CheckCircle2, DollarSign, Calendar, FileText } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useContasStore } from "@/store/useContasStore";
import { pagarContaSchema, PagarContaInput } from "@/lib/validations/conta";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DateInput } from "@/components/ui/date-input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function PagarContaSheet() {
  const { pagarModalOpen, closePagarModal, contaSelecionadaParaPagar } = useUIStore();
  const { triggerRefresh } = useContasStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<PagarContaInput>({
    resolver: zodResolver(pagarContaSchema),
    defaultValues: {
      dataPagamento: formatDate(new Date()),
      valorPago: 0,
      observacao: "",
    },
  });

  React.useEffect(() => {
    if (contaSelecionadaParaPagar) {
      reset({
        dataPagamento: formatDate(new Date()),
        valorPago: Number(contaSelecionadaParaPagar.valor),
        observacao: contaSelecionadaParaPagar.observacao || "",
      });
    }
  }, [contaSelecionadaParaPagar, reset]);

  const onSubmit = async (data: PagarContaInput) => {
    if (!contaSelecionadaParaPagar) return;

    try {
      setIsLoading(true);
      const res = await fetch(`/api/contas/${contaSelecionadaParaPagar.id}/pagar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Erro ao registrar pagamento");
      }

      toast({
        variant: "success",
        title: "Conta paga!",
        description: `O pagamento de ${formatCurrency(data.valorPago)} foi registrado com sucesso.`,
      });

      closePagarModal();
      triggerRefresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível registrar o pagamento.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!contaSelecionadaParaPagar) return null;

  return (
    <Sheet open={pagarModalOpen} onOpenChange={(open) => !open && closePagarModal()}>
      <SheetContent side="bottom" className="rounded-t-3xl max-w-lg mx-auto p-6 bg-card border-t border-border">
        <SheetHeader className="pb-3 text-left">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-success/15 text-success shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle className="text-lg font-serif">
                Registrar Pagamento
              </SheetTitle>
              <SheetDescription className="text-xs">
                Confirme os dados do pagamento da conta
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Resumo da conta selecionada */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border/80 my-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Fornecedor
            </span>
            <span className="text-sm font-bold text-foreground">
              {contaSelecionadaParaPagar.fornecedor}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Vencimento Original:</span>
            <span className="font-medium text-foreground">
              {formatDate(contaSelecionadaParaPagar.dataVencimento)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Valor Previsto:</span>
            <span className="font-bold text-primary">
              {formatCurrency(contaSelecionadaParaPagar.valor)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="dataPagamento" className="text-xs font-semibold">
              Data do Pagamento (DD/MM/AAAA)
            </Label>
            <Controller
              name="dataPagamento"
              control={control}
              render={({ field }) => (
                <DateInput
                  id="dataPagamento"
                  className="h-11 rounded-xl text-sm"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              )}
            />
            {errors.dataPagamento && (
              <p className="text-xs text-destructive font-medium">
                {errors.dataPagamento.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="valorPago" className="text-xs font-semibold">
              Valor Pago (R$)
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground z-10">
                R$
              </span>
              <Controller
                name="valorPago"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    id="valorPago"
                    placeholder="0,00"
                    className="pl-10 h-11 text-sm rounded-xl font-bold"
                    disabled={isLoading}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
              />
            </div>
            {errors.valorPago && (
              <p className="text-xs text-destructive font-medium">
                {errors.valorPago.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observacao" className="text-xs font-semibold">
              Observação (opcional)
            </Label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="observacao"
                placeholder="Ex: Pago via PIX pelo banco Cora"
                className="pl-10 h-11 text-sm rounded-xl"
                disabled={isLoading}
                {...register("observacao")}
              />
            </div>
          </div>

          <SheetFooter className="pt-2 flex flex-row gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={closePagarModal}
              disabled={isLoading}
              className="flex-1 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="success"
              disabled={isLoading}
              className="flex-1 rounded-xl font-semibold shadow-md shadow-success/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Confirmar Pagamento"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
