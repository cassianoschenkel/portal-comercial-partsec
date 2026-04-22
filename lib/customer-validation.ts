import { z } from "zod";

export const customerSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "Informe a razao social.")
    .max(160, "Razao social muito longa."),
  tradeName: z.string().trim().max(160).optional(),
  document: z
    .string()
    .trim()
    .min(5, "Informe o documento.")
    .max(32, "Documento muito longo."),
  contactName: z
    .string()
    .trim()
    .min(2, "Informe o nome do contato.")
    .max(120, "Nome do contato muito longo."),
  contactEmail: z
    .string()
    .trim()
    .email("Informe um e-mail valido.")
    .max(160, "E-mail muito longo."),
  contactPhone: z.string().trim().max(32).optional(),
  notes: z.string().trim().max(2000, "Observacoes muito longas.").optional()
});

export type CustomerInput = z.infer<typeof customerSchema>;

export type CustomerFormState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof CustomerInput, string[]>>;
};

export function parseCustomerFormData(formData: FormData) {
  return customerSchema.safeParse({
    companyName: formData.get("companyName"),
    tradeName: formData.get("tradeName") || undefined,
    document: formData.get("document"),
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone") || undefined,
    notes: formData.get("notes") || undefined
  });
}
