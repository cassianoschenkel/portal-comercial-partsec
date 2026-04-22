//import { ProposalPlan } from "@prisma/client";
//import { z } from "zod";

//export const proposalSchema = z.object({
//  customerId: z.string().min(1, "Cliente obrigatório."),
//  title: z.string().min(3, "Título obrigatório."),
///  plan: z.nativeEnum(ProposalPlan),
//  activeCount: z.coerce.number().int().positive("Ativos deve ser maior que zero."),
//  discountPercent: z.coerce.number().min(0).max(20),
//  notes: z.string().optional().or(z.literal("")),
//});

///export type ProposalInput = z.infer<typeof proposalSchema>;
import { ProposalPlan } from "@prisma/client";
import { z } from "zod";

export const proposalSchema = z.object({
  customerId: z.string().min(1, "Cliente obrigatório."),
  title: z.string().min(3, "Título obrigatório."),
  plan: z.nativeEnum(ProposalPlan),
  activeCount: z.coerce.number().int().positive("Ativos deve ser maior que zero."),
  discountPercent: z.coerce.number().min(0).max(20),
  setupFee: z.coerce.number().min(0),
  notes: z.string().optional().or(z.literal("")),
  scopeDescription: z.string().optional().or(z.literal("")),
});

export type ProposalInput = z.infer<typeof proposalSchema>;
