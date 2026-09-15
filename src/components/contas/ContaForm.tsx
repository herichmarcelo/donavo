"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  DollarSign,
  FileText,
  Loader2,
  Repeat,
  Store,
  Tag,
} from "lucide-react";
import { contaSchema, ContaInput } from "@/lib/validations/conta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DateInput } from "@/components/ui/date-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/formatters";

interface ContaFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export function ContaForm({ initialData, isEditing = false }: ContaFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<ContaInput>({
    resolver: zodResolver(contaSchema),
    defaultValues: initialData
      ? {
          fornecedor: initialData.fornecedor,
          valor: Number(initialData.valor),
          discriminacao: initialData.discriminacao || "",
          dataVencimento: formatDate(initialData.dataVencimento),
          categoria: initialData.categoria || "CUSTEIO",
          observacao: initialData.observacao || "",
          parcelado: false,
          numeroParcelas: 1,
        }
      : {
          fornecedor: "",
          valor: "" as any,
          discriminacao: "",
          dataVencimento: formatDate(new Date()),
          categoria: "CUSTEIO",
          observacao: "",
          parcelado: false,
          numeroParcelas: 1,
        },
  });

  const parcelado = watch("parcelado");
  const categoria = watch("categoria");

  const onSubmit = async (data: ContaInput) => {
    try {
      setIsLoading(true);
      const url = isEditing ? `/api/contas/${initialData.id}` : "/api/contas";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Erro ao salvar conta");
      }

      toast({
        variant: "success",
        title: isEditing ? "Conta atualizada!" : "Conta cadastrada!",
        description: isEditing
          ? "As alterações foram salvas com sucesso."
          : data.parcelado && (data.numeroParcelas || 1) > 1
          ? `${data.numeroParcelas} parcelas foram geradas no sistema.`
          : "A nova conta foi cadastrada no sistema.",
      });

      router.push("/contas");
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao processar a conta.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl border-border shadow-sm">
      <CardContent className="p-5 sm:p-7">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Fornecedor com Atalhos Rápidos */}
          <div className="space-y-2">
            <Label htmlFor="fornecedor" className="text-xs font-semibold">
              Fornecedor / Beneficiário *
            </Label>
            <div className="relative">
              <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="fornecedor"
                placeholder="Ex: Assai Atacadista, Aluguel, Supergasbras"
                className="pl-10 h-11 rounded-xl text-sm"
                disabled={isLoading}
                {...register("fornecedor")}
              />
            </div>
            {errors.fornecedor && (
              <p className="text-xs text-destructive font-medium">
                {errors.fornecedor.message}
              </p>
            )}
          </div>

          {/* Grid: Valor & Vencimento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="valor" className="text-xs font-semibold">
                Valor Total (R$) *
              </Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground z-10">
                  R$
                </span>
                <Controller
                  name="valor"
                  control={control}
                  render={({ field }) => (
                    <CurrencyInput
                      id="valor"
                      placeholder="0,00"
                      className="pl-10 h-11 rounded-xl text-sm font-bold"
                      disabled={isLoading}
                      value={field.value}
                      onChange={(val) => field.onChange(val)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  )}
                />
              </div>
              {errors.valor && (
                <p className="text-xs text-destructive font-medium">
                  {errors.valor.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dataVencimento" className="text-xs font-semibold">
                Data de Vencimento (DD/MM/AAAA) *
              </Label>
              <Controller
                name="dataVencimento"
                control={control}
                render={({ field }) => (
                  <DateInput
                    id="dataVencimento"
                    className="h-11 rounded-xl text-sm"
                    disabled={isLoading}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
              />
              {errors.dataVencimento && (
                <p className="text-xs text-destructive font-medium">
                  {errors.dataVencimento.message}
                </p>
              )}
            </div>
          </div>

          {/* Grid: Discriminação & Categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="discriminacao" className="text-xs font-semibold">
                Discriminação / Itens
              </Label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="discriminacao"
                  placeholder="Ex: Carnes para churrasco, Insumos semanais"
                  className="pl-10 h-11 rounded-xl text-sm"
                  disabled={isLoading}
                  {...register("discriminacao")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="categoria" className="text-xs font-semibold">
                Categoria da Despesa *
              </Label>
              <Select
                value={categoria}
                onValueChange={(val: any) =>
                  setValue("categoria", val, { shouldValidate: true })
                }
              >
                <SelectTrigger className="h-11 rounded-xl text-sm">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTEIO">
                    Custeio (Insumos, gás, alimentos, manutenção)
                  </SelectItem>
                  <SelectItem value="INVESTIMENTO">
                    Investimento (Equipamentos, reformas)
                  </SelectItem>
                  <SelectItem value="OUTRAS">
                    Outras despesas
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Parcelamento Automático (Apenas na criação) */}
          {!isEditing && (
            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Repetir ou Parcelar Conta
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Gera automaticamente N contas mensais (ex: gás, aluguel, climatizador)
                    </p>
                  </div>
                </div>
                <Switch
                  checked={parcelado}
                  onCheckedChange={(checked) => setValue("parcelado", checked)}
                />
              </div>

              {parcelado && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 animate-fade-in">
                  <div className="space-y-1">
                    <Label htmlFor="numeroParcelas" className="text-xs font-medium">
                      Número de Parcelas / Meses
                    </Label>
                    <Input
                      id="numeroParcelas"
                      type="number"
                      min={2}
                      max={36}
                      className="h-10 rounded-lg text-sm"
                      {...register("numeroParcelas")}
                    />
                  </div>
                  <div className="flex items-end text-xs text-muted-foreground pb-2">
                    Será criada 1 conta a cada 30 dias automaticamente.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Observações */}
          <div className="space-y-1.5">
            <Label htmlFor="observacao" className="text-xs font-semibold">
              Observações Adicionais (opcional)
            </Label>
            <Input
              id="observacao"
              placeholder="Ex: Pagar após conferir nota fiscal"
              className="h-11 rounded-xl text-sm"
              disabled={isLoading}
              {...register("observacao")}
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
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
              className="rounded-xl px-6 bg-primary hover:bg-brand-terracottaDark text-white shadow-md shadow-primary/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : isEditing ? (
                "Salvar Alterações"
              ) : (
                "Cadastrar Conta"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
