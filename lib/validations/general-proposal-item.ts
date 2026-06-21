import { GeneralPricingMode, Prisma } from "@prisma/client";
import { z } from "zod";

function decimalField(
  message: string,
  options?: { positive?: boolean; maxDecimalPlaces?: number }
) {
  return z
    .string()
    .trim()
    .min(1, message)
    .refine((value) => {
      try {
        const decimal = new Prisma.Decimal(value);
        return (
          decimal.isFinite() &&
          (options?.positive ? decimal.gt(0) : decimal.gte(0)) &&
          (options?.maxDecimalPlaces === undefined ||
            decimal.decimalPlaces() <= options.maxDecimalPlaces)
        );
      } catch {
        return false;
      }
    }, message);
}

function optionalNonNegativeDecimal(message: string, maxDecimalPlaces = 4) {
  return z.preprocess(
    (value) => (value === "" || value === null ? "0" : value),
    decimalField(message, { maxDecimalPlaces })
  );
}

const optionalPositiveInteger = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce
    .number()
    .int("O prazo deve ser um número inteiro.")
    .positive("O prazo deve ser maior que zero.")
    .optional()
);

export const generalProposalItemSchema = z
  .object({
    vendorId: z.string().trim().optional(),
    sku: z.string().trim().optional(),
    productName: z.string().trim().min(1, "Produto é obrigatório."),
    description: z.string().trim().optional(),
    category: z.string().trim().optional(),
    quantity: decimalField("Quantidade deve ser maior que zero.", {
      positive: true,
      maxDecimalPlaces: 2,
    }),
    licenseTermMonths: optionalPositiveInteger,
    costUnitPrice: decimalField("Custo unitário deve ser zero ou maior.", {
      maxDecimalPlaces: 2,
    }),
    listUnitPrice: optionalNonNegativeDecimal(
      "Preço de lista deve ser zero ou maior.",
      2
    ),
    pricingMode: z.nativeEnum(GeneralPricingMode, {
      errorMap: () => ({ message: "Modo de precificação inválido." }),
    }),
    marginPercent: optionalNonNegativeDecimal(
      "Margem deve ser zero ou maior."
    ),
    markupPercent: optionalNonNegativeDecimal(
      "Markup deve ser zero ou maior."
    ),
    discountPercent: optionalNonNegativeDecimal(
      "Desconto deve ser zero ou maior."
    ),
    saleUnitPrice: z.string().trim().optional(),
    isVisibleToClient: z.boolean(),
    internalNotes: z.string().trim().optional(),
    sortOrder: z.coerce
      .number()
      .int("Ordem deve ser um número inteiro.")
      .min(0, "Ordem deve ser zero ou maior."),
  })
  .superRefine((data, context) => {
    const margin = new Prisma.Decimal(data.marginPercent);
    const discount = new Prisma.Decimal(data.discountPercent);

    if (
      data.pricingMode === GeneralPricingMode.MARGIN &&
      margin.gte(100)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["marginPercent"],
        message: "Margem deve ser menor que 100%.",
      });
    }

    if (discount.gt(100)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountPercent"],
        message: "Desconto deve ser menor ou igual a 100%.",
      });
    }

    if (data.pricingMode === GeneralPricingMode.MANUAL) {
      let isValidManualPrice = false;
      try {
        const saleUnitPrice = new Prisma.Decimal(data.saleUnitPrice || "");
        isValidManualPrice =
          saleUnitPrice.isFinite() &&
          saleUnitPrice.gte(0) &&
          saleUnitPrice.decimalPlaces() <= 2;
      } catch {}

      if (!isValidManualPrice) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["saleUnitPrice"],
          message: "Informe um preço de venda manual válido.",
        });
      }
    }
  });
