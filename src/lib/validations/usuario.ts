import { z } from "zod";

export const usuarioSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("Insira um e-mail válido"),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres").optional().or(z.literal("")),
  cargo: z.enum(["admin", "operador", "caixa"], {
    errorMap: () => ({ message: "Selecione um cargo válido" }),
  }),
  ativo: z.boolean().default(true),
});

export type UsuarioInput = z.infer<typeof usuarioSchema>;
