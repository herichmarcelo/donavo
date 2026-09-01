import { z } from "zod";

export const entradaCaixaSchema = z.object({
  descricao: z.string().min(2, "A descrição é obrigatória"),
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
  dataEntrada: z.string().min(1, "A data da entrada é obrigatória"),
  tipo: z.enum(["MANUAL", "VENDA", "OUTROS"], {
    errorMap: () => ({ message: "Selecione um tipo válido" }),
  }),
  observacao: z.string().optional().nullable(),
});

export type EntradaCaixaInput = z.infer<typeof entradaCaixaSchema>;
