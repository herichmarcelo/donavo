import { z } from "zod";
import { parseCurrencyInput } from "@/lib/formatters";

export const entradaCaixaSchema = z.object({
  descricao: z.string().min(2, "A descrição é obrigatória"),
  valor: z
    .union([
      z.number({ invalid_type_error: "Insira um valor válido" }),
      z.string().transform((val) => parseCurrencyInput(val)),
    ])
    .pipe(
      z
        .number({ invalid_type_error: "Insira um valor válido" })
        .positive("O valor deve ser maior que zero")
    ),
  dataEntrada: z.string().min(1, "A data da entrada é obrigatória"),
  tipo: z.enum(["MANUAL", "VENDA", "OUTROS"], {
    errorMap: () => ({ message: "Selecione um tipo válido" }),
  }),
  observacao: z.string().optional().nullable(),
});

export type EntradaCaixaInput = z.infer<typeof entradaCaixaSchema>;
