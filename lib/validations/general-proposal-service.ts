import {
  GeneralProposalServiceType,
  GeneralServicePricingMode,
  Prisma,
} from "@prisma/client";
import { z } from "zod";

function decimalField(message: string) {
  return z.preprocess(
    (value) => (value === "" || value === null ? "0" : value),
    z.string().trim().refine((value) => {
      try {
        const decimal = new Prisma.Decimal(value);
        return (
          decimal.isFinite() &&
          decimal.gte(0) &&
          decimal.decimalPlaces() <= 2
        );
      } catch {
        return false;
      }
    }, message)
  );
}

export const generalProposalServiceSchema = z
  .object({
    serviceName: z.string().trim().min(1, "Nome do serviço é obrigatório."),
    description: z.string().trim().optional(),
    serviceType: z.nativeEnum(GeneralProposalServiceType, {
      errorMap: () => ({ message: "Tipo de serviço inválido." }),
    }),
    pricingMode: z.nativeEnum(GeneralServicePricingMode, {
      errorMap: () => ({ message: "Modo de cobrança inválido." }),
    }),
    estimatedHours: decimalField(
      "Horas estimadas devem ser zero ou maiores, com até duas casas decimais."
    ),
    internalHourlyCost: decimalField(
      "Custo por hora deve ser zero ou maior, com até duas casas decimais."
    ),
    saleHourlyRate: decimalField(
      "Valor por hora deve ser zero ou maior, com até duas casas decimais."
    ),
    fixedCost: decimalField(
      "Custo fixo deve ser zero ou maior, com até duas casas decimais."
    ),
    fixedSalePrice: decimalField(
      "Valor fixo deve ser zero ou maior, com até duas casas decimais."
    ),
    isVisibleToClient: z.boolean(),
    internalNotes: z.string().trim().optional(),
    sortOrder: z.coerce
      .number()
      .int("Ordem deve ser um número inteiro.")
      .min(0, "Ordem deve ser zero ou maior."),
  })
  .superRefine((data, context) => {
    if (
      data.pricingMode === GeneralServicePricingMode.HOURLY &&
      new Prisma.Decimal(data.estimatedHours).lte(0)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["estimatedHours"],
        message: "Horas estimadas devem ser maiores que zero.",
      });
    }
  });
