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
import { ModuleType, ProposalItemPricingMode, ProposalPlan } from "@prisma/client";
import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (value === null || value === "") {
    return undefined;
  }

  return value;
};

const proposalModuleSchema = z.object({
  moduleType: z.nativeEnum(ModuleType),
  quantity: z.coerce.number().int().positive("Quantidade deve ser maior que zero."),
  pricingMode: z.nativeEnum(ProposalItemPricingMode).default(ProposalItemPricingMode.AUTO),
  manualMonthlyPrice: z.preprocess(
    emptyToUndefined,
    z.coerce.number().optional()
  ),
  manualSetupPrice: z.preprocess(
    emptyToUndefined,
    z.coerce.number().optional()
  ),
  pricingJustification: z.preprocess(emptyToUndefined, z.string().trim().optional()),
}).superRefine((data, ctx) => {
  if (data.pricingMode !== ProposalItemPricingMode.MANUAL) {
    return;
  }

  if (
    data.manualMonthlyPrice === undefined ||
    !Number.isFinite(data.manualMonthlyPrice) ||
    data.manualMonthlyPrice < 0
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Preço mensal customizado deve ser maior ou igual a zero.",
      path: ["manualMonthlyPrice"],
    });
  }

  if (
    data.manualSetupPrice === undefined ||
    !Number.isFinite(data.manualSetupPrice) ||
    data.manualSetupPrice < 0
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Setup customizado deve ser maior ou igual a zero.",
      path: ["manualSetupPrice"],
    });
  }

  if (!data.pricingJustification) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Justificativa interna obrigatória para preço customizado.",
      path: ["pricingJustification"],
    });
  }
});

export const proposalSchema = z.object({
  customerId: z.string().min(1, "Cliente obrigatório."),
  title: z.string().min(3, "Título obrigatório."),
  plan: z.nativeEnum(ProposalPlan),
  activeCount: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive("Ativos deve ser maior que zero.").optional()
  ),
  modules: z.array(proposalModuleSchema).optional(),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  discountAmount: z.coerce.number().min(0).default(0),
  validityDays: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().default(15)
  ),
  notes: z.preprocess(emptyToUndefined, z.string().optional()),
  internalNotes: z.preprocess(emptyToUndefined, z.string().optional()),
  scopeDescription: z.preprocess(emptyToUndefined, z.string().optional()),
}).superRefine((data, ctx) => {
  if ((!data.modules || data.modules.length === 0) && !data.activeCount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Informe ao menos um módulo ou a quantidade de ativos.",
      path: ["modules"],
    });
  }

  if (data.modules && data.modules.length > 0) {
    const moduleTypes = data.modules.map((module) => module.moduleType);
    const uniqueModuleTypes = new Set(moduleTypes);

    if (uniqueModuleTypes.size !== moduleTypes.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Não é permitido repetir o mesmo módulo na proposta.",
        path: ["modules"],
      });
    }
  }
});

export type ProposalInput = z.infer<typeof proposalSchema>;
