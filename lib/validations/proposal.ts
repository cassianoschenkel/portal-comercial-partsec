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
import { ModuleType, ProposalPlan } from "@prisma/client";
import { z } from "zod";

const proposalModuleSchema = z.object({
  moduleType: z.nativeEnum(ModuleType),
  quantity: z.coerce.number().int().positive("Quantidade deve ser maior que zero."),
});

export const proposalSchema = z.object({
  customerId: z.string().min(1, "Cliente obrigatório."),
  title: z.string().min(3, "Título obrigatório."),
  plan: z.nativeEnum(ProposalPlan),
  activeCount: z.coerce.number().int().positive("Ativos deve ser maior que zero.").optional(),
  modules: z.array(proposalModuleSchema).optional(),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  discountAmount: z.coerce.number().min(0).default(0),
  validityDays: z.coerce.number().int().positive().default(15),
  notes: z.string().optional().or(z.literal("")),
  internalNotes: z.string().optional().or(z.literal("")),
  scopeDescription: z.string().optional().or(z.literal("")),
}).superRefine((data, ctx) => {
  if ((!data.modules || data.modules.length === 0) && !data.activeCount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Informe ao menos um módulo ou a quantidade de ativos.",
      path: ["modules"],
    });
  }
});

export type ProposalInput = z.infer<typeof proposalSchema>;
