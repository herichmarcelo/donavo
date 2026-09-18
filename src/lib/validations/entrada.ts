import { z } from "zod";
import { parseCurrencyInput } from "@/lib/formatters";

const currencyField = z
  .union([
    z.number(),
    z.string().transform((val) => parseCurrencyInput(val)),
  ])
  .pipe(
    z
      .number({ invalid_type_error: "Insira um valor válido" })
      .min(0, "O valor não pode ser negativo")
  )
  .default(0);

export const entradaCaixaSchema = z
  .object({
    descricao: z.string().min(2, "A descrição é obrigatória"),
    valorDinheiro: currencyField,
    valorDebito: currencyField,
    valorCredito: currencyField,
    valorPix: currencyField,
    valorVoucher: currencyField,
    valor: currencyField.optional(),
    dataEntrada: z.string().min(1, "A data da entrada é obrigatória"),
    tipo: z
      .enum(["MANUAL", "VENDA", "OUTROS"], {
        errorMap: () => ({ message: "Selecione um tipo válido" }),
      })
      .default("VENDA"),
    observacao: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      const soma =
        (Number(data.valorDinheiro) || 0) +
        (Number(data.valorDebito) || 0) +
        (Number(data.valorCredito) || 0) +
        (Number(data.valorPix) || 0) +
        (Number(data.valorVoucher) || 0) +
        (Number(data.valor) || 0);
      return soma > 0;
    },
    {
      message: "Pelo menos uma forma de pagamento deve ter valor maior que zero (R$ 0,00)",
      path: ["valorDinheiro"],
    }
  );

export type EntradaCaixaInput = z.infer<typeof entradaCaixaSchema>;

