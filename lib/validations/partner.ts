import { z } from "zod";

export const createPartnerSchema = z.object({
  name: z.string().min(2, "Nome obrigatório."),
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres."),
  companyName: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  commissionPercent: z.coerce.number().min(0).max(100),
  isActive: z.coerce.boolean().optional(),
});

export const updatePartnerSchema = z.object({
  name: z.string().min(2, "Nome obrigatório."),
  email: z.string().email("E-mail inválido."),
  password: z.string().optional().or(z.literal("")),
  companyName: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  commissionPercent: z.coerce.number().min(0).max(100),
  isActive: z.coerce.boolean().optional(),
});