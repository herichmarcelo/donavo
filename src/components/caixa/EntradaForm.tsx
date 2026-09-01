"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, DollarSign, FileText, Loader2, Tag } from "lucide-react";
import { entradaCaixaSchema, EntradaCaixaInput } from "@/lib/validations/entrada";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { formatDateInput } from "@/lib/formatters";

export function EntradaForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EntradaCaixaInput>({
    resolver: zodResolver(entradaCaixaSchema),
    defaultValues: {
      descricao: "",
      valor: "" as any,
      dataEntrada: formatDateInput(new Date()),
      tipo: "MANUAL",
      observacao: "",
    },
  });

  const tipo = watch("tipo");

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
        description: "A entrada de caixa foi computada no sistema.",
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="descricao" className="text-xs font-semibold">
              Descrição da Entrada *
            </Label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="descricao"
                placeholder="Ex: Reforço de Caixa, Vendas em Dinheiro, Evento"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="valor" className="text-xs font-semibold">
                Valor Recebido (R$) *
              </Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  R$
                </span>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="pl-10 h-11 rounded-xl text-sm font-bold"
                  disabled={isLoading}
                  {...register("valor")}
                />
              </div>
              {errors.valor && (
                <p className="text-xs text-destructive font-medium">
                  {errors.valor.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dataEntrada" className="text-xs font-semibold">
                Data do Recebimento *
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dataEntrada"
                  type="date"
                  className="pl-10 h-11 rounded-xl text-sm"
                  disabled={isLoading}
                  {...register("dataEntrada")}
                />
              </div>
              {errors.dataEntrada && (
                <p className="text-xs text-destructive font-medium">
                  {errors.dataEntrada.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tipo" className="text-xs font-semibold">
              Tipo de Entrada *
            </Label>
            <Select
              value={tipo}
              onValueChange={(val: any) =>
                setValue("tipo", val, { shouldValidate: true })
              }
            >
              <SelectTrigger className="h-11 rounded-xl text-sm">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANUAL">Entrada Manual / Aporte</SelectItem>
                <SelectItem value="VENDA">Venda de Balcão / Mesas</SelectItem>
                <SelectItem value="OUTROS">Outros Recebimentos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observacao" className="text-xs font-semibold">
              Observação (opcional)
            </Label>
            <Input
              id="observacao"
              placeholder="Ex: Sangria devolvida no fim do turno"
              className="h-11 rounded-xl text-sm"
              disabled={isLoading}
              {...register("observacao")}
            />
          </div>

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
