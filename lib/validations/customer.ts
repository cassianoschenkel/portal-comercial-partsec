import { z } from "zod";

export const customerSchema = z.object({
  companyName: z.string().min(2, "Razão social obrigatória."),
  tradeName: z.string().optional().or(z.literal("")),
  document: z.string().min(3, "Documento obrigatório."),
  contactName: z.string().min(2, "Nome do contato obrigatório."),
  contactEmail: z.string().email("E-mail inválido."),
  contactPhone: z.string().min(8, "Telefone inválido."),
  notes: z.string().optional().or(z.literal("")),
});

export type CustomerInput = z.infer<typeof customerSchema>;
