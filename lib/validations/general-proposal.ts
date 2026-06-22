import { GeneralProposalType } from "@prisma/client";
import { z } from "zod";

function optionalString() {
  return z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === ""
        ? undefined
        : value,
    z.string().trim().optional()
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

const optionalDate = z.preprocess(
  (value) => {
    if (value === "" || value === null) return undefined;
    return typeof value === "string" ? new Date(`${value}T12:00:00`) : value;
  },
  z.coerce.date({ invalid_type_error: "Data de validade inválida." }).optional()
);

export const createGeneralProposalSchema = z.object({
  customerId: z.string().trim().min(1, "Cliente é obrigatório."),
  vendorId: z.string().trim().min(1, "Fabricante é obrigatório."),
  proposalType: z.nativeEnum(GeneralProposalType, {
    errorMap: () => ({ message: "Tipo de proposta inválido." }),
  }),
  title: z.string().trim().min(1, "Título é obrigatório."),
  licenseTermMonths: optionalPositiveInteger,
  validUntil: optionalDate,
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Moeda deve usar um código de três letras."),
  paymentTerms: optionalString(),
  executiveSummary: optionalString(),
  projectScope: optionalString(),
  commercialNotes: optionalString(),
  internalNotes: optionalString(),
});

export const updateGeneralProposalSchema = createGeneralProposalSchema
  .omit({ customerId: true, currency: true })
  .extend({
    proposalId: z.string().trim().min(1, "Proposta é obrigatória."),
  });
