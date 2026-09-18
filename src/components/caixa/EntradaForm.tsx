"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Banknote,
  CreditCard,
  QrCode,
  Ticket,
  FileText,
  Loader2,
  Calculator,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { entradaCaixaSchema, EntradaCaixaInput } from "@/lib/validations/entrada";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DateInput } from "@/components/ui/date-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, formatDate } from "@/lib/formatters";

export function EntradaForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<EntradaCaixaInput>({
    resolver: zodResolver(entradaCaixaSchema),
    defaultValues: {
      descricao: "",
      valorDinheiro: 0,
      valorDebito: 0,
      valorCredito: 0,
      valorPix: 0,
      valorVoucher: 0,
      dataEntrada: formatDate(new Date()),
      tipo: "VENDA",
      observacao: "",
    },
  });

  // Observa os 5 campos para cálculo do total em tempo real
  const [
    valorDinheiro,
    valorDebito,
    valorCredito,
    valorPix,
    valorVoucher,
  ] = watch([
    "valorDinheiro",
    "valorDebito",
    "valorCredito",
    "valorPix",
    "valorVoucher",
  ]);

  const totalCalculado = React.useMemo(() => {
    return (
      (Number(valorDinheiro) || 0) +
      (Number(valorDebito) || 0) +
      (Number(valorCredito) || 0) +
      (Number(valorPix) || 0) +
      (Number(valorVoucher) || 0)
    );
  }, [valorDinheiro, valorDebito, valorCredito, valorPix, valorVoucher]);

  const onSubmit = async (data: EntradaCaixaInput) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/caixa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Erro ao registrar entrada");
      }

      toast({
        variant: "success",
        title: "Entrada registrada!",
        description: `Entrada total de ${formatCurrency(totalCalculado)} computada no caixa.`,
      });

      router.push("/caixa");
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar a entrada.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl border-border shadow-sm">
      <CardContent className="p-5 sm:p-7">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Básicas: Descrição, Data e Tipo Fixo */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-7 space-y-1.5">
              <Label htmlFor="descricao" className="text-xs font-semibold">
                Descrição da Entrada *
              </Label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="descricao"
                  placeholder="Ex: Venda Balcão Almoço, Movimento do Dia"
                  className="pl-10 h-11 rounded-xl text-sm"
                  disabled={isLoading}
                  {...register("descricao")}
                />
              </div>
              {errors.descricao && (
                <p className="text-xs text-destructive font-medium">
                  {errors.descricao.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-5 space-y-1.5">
              <Label htmlFor="dataEntrada" className="text-xs font-semibold">
                Data do Recebimento *
              </Label>
              <Controller
                name="dataEntrada"
                control={control}
                render={({ field }) => (
                  <DateInput
                    id="dataEntrada"
                    className="h-11 rounded-xl text-sm"
                    disabled={isLoading}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
              />
              {errors.dataEntrada && (
                <p className="text-xs text-destructive font-medium">
                  {errors.dataEntrada.message}
                </p>
              )}
            </div>
          </div>

          {/* Tipo de Entrada Fixo */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Tipo de Lançamento:
              </span>
              <Badge variant="success" className="text-xs font-medium">
                Venda de Balcão / Caixa
              </Badge>
            </div>
            <span className="text-2xs text-muted-foreground">
              Entrada com segmentação de pagamentos
            </span>
          </div>

          {/* Seção: Valores por Forma de Pagamento */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Valores Recebidos por Forma de Pagamento
                </h3>
                <p className="text-xs text-muted-foreground">
                  Preencha os valores recebidos em cada modalidade (preenchimento em R$)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* 1. Dinheiro */}
              <div className="space-y-1.5 p-3.5 rounded-xl border border-border bg-card/50 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Banknote className="h-4 w-4" />
                  </div>
                  <span>Dinheiro (R$)</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground z-10">
                    R$
                  </span>
                  <Controller
                    name="valorDinheiro"
                    control={control}
                    render={({ field }) => (
                      <CurrencyInput
                        id="valorDinheiro"
                        placeholder="0,00"
                        className="pl-9 h-10 rounded-lg text-sm font-semibold"
                        disabled={isLoading}
                        value={field.value}
                        onChange={(val) => field.onChange(val)}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    )}
                  />
                </div>
              </div>

              {/* 2. Cartão de Débito */}
              <div className="space-y-1.5 p-3.5 rounded-xl border border-border bg-card/50 hover:border-blue-500/30 transition-colors">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <div className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <span>Cartão de Débito (R$)</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground z-10">
                    R$
                  </span>
                  <Controller
                    name="valorDebito"
                    control={control}
                    render={({ field }) => (
                      <CurrencyInput
                        id="valorDebito"
                        placeholder="0,00"
                        className="pl-9 h-10 rounded-lg text-sm font-semibold"
                        disabled={isLoading}
                        value={field.value}
                        onChange={(val) => field.onChange(val)}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    )}
                  />
                </div>
              </div>

              {/* 3. Cartão de Crédito */}
              <div className="space-y-1.5 p-3.5 rounded-xl border border-border bg-card/50 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <div className="p-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <span>Cartão de Crédito (R$)</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground z-10">
                    R$
                  </span>
                  <Controller
                    name="valorCredito"
                    control={control}
                    render={({ field }) => (
                      <CurrencyInput
                        id="valorCredito"
                        placeholder="0,00"
                        className="pl-9 h-10 rounded-lg text-sm font-semibold"
                        disabled={isLoading}
                        value={field.value}
                        onChange={(val) => field.onChange(val)}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    )}
                  />
                </div>
              </div>

              {/* 4. PIX */}
              <div className="space-y-1.5 p-3.5 rounded-xl border border-border bg-card/50 hover:border-cyan-500/30 transition-colors">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <div className="p-1 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <span>PIX (R$)</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground z-10">
                    R$
                  </span>
                  <Controller
                    name="valorPix"
                    control={control}
                    render={({ field }) => (
                      <CurrencyInput
                        id="valorPix"
                        placeholder="0,00"
                        className="pl-9 h-10 rounded-lg text-sm font-semibold"
                        disabled={isLoading}
                        value={field.value}
                        onChange={(val) => field.onChange(val)}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    )}
                  />
                </div>
              </div>

              {/* 5. Voucher */}
              <div className="space-y-1.5 p-3.5 rounded-xl border border-border bg-card/50 hover:border-amber-500/30 transition-colors">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <div className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Ticket className="h-4 w-4" />
                  </div>
                  <span>Voucher / Refeição (R$)</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground z-10">
                    R$
                  </span>
                  <Controller
                    name="valorVoucher"
                    control={control}
                    render={({ field }) => (
                      <CurrencyInput
                        id="valorVoucher"
                        placeholder="0,00"
                        className="pl-9 h-10 rounded-lg text-sm font-semibold"
                        disabled={isLoading}
                        value={field.value}
                        onChange={(val) => field.onChange(val)}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Alerta de erro de validação (quando todos os 5 campos estão zerados) */}
            {errors.valorDinheiro && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errors.valorDinheiro.message}</span>
              </div>
            )}
          </div>

          {/* Observação */}
          <div className="space-y-1.5">
            <Label htmlFor="observacao" className="text-xs font-semibold">
              Observação (opcional)
            </Label>
            <Input
              id="observacao"
              placeholder="Ex: Turno da manhã, sangria devolvida, evento especial"
              className="h-11 rounded-xl text-sm"
              disabled={isLoading}
              {...register("observacao")}
            />
          </div>

          {/* Card de Total Calculado em Tempo Real (Readonly) */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  Total da Entrada (Calculado)
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Soma automática das 5 formas de pagamento
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {formatCurrency(totalCalculado)}
              </span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              className="rounded-xl px-5"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-xl px-6 bg-success hover:bg-success/90 text-white shadow-md shadow-success/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Confirmar Entrada"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

