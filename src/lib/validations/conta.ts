import { z } from "zod";

export const contaSchema = z.object({
  fornecedor: z.string().min(2, "O nome do fornecedor é obrigatório"),
  valor: z
    .number({ invalid_type_error: "Insira um valor válido" })
    .positive("O valor deve ser maior que zero")
    .or(
      z.string().transform((val) => {
        const clean = val.replace(/[R$\s]/g, "").replace(/\./g, "").replace(",", ".");
        const n = parseFloat(clean);
        return isNaN(n) ? 0 : n;
      })
    ),
  discriminacao: z.string().optional().nullable(),
  dataVencimento: z.string().min(1, "A data de vencimento é obrigatória"),
  categoria: z.enum(["CUSTEIO", "INVESTIMENTO", "OUTRAS"], {
    errorMap: () => ({ message: "Selecione uma categoria válida" }),
  }),
  observacao: z.string().optional().nullable(),
  // Campos para parcelamento automático
  parcelado: z.boolean().optional().default(false),
  numeroParcelas: z.coerce.number().min(1).max(36).optional().default(1),
  intervaloDias: z.coerce.number().min(1).optional().default(30),
});

export type ContaInput = z.infer<typeof contaSchema>;

export const pagarContaSchema = z.object({
  dataPagamento: z.string().min(1, "Data de pagamento é obrigatória"),
  valorPago: z
    .number({ invalid_type_error: "Insira um valor válido" })
    .positive("O valor pago deve ser maior que zero")
    .or(
      z.string().transform((val) => {
        const clean = val.replace(/[R$\s]/g, "").replace(/\./g, "").replace(",", ".");
        const n = parseFloat(clean);
        return isNaN(n) ? 0 : n;
      })
    ),
  observacao: z.string().optional().nullable(),
});

export type PagarContaInput = z.infer<typeof pagarContaSchema>;
