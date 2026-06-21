import { GeneralProposalStatus } from "@prisma/client";
import { z } from "zod";

export const updateGeneralProposalStatusSchema = z.object({
  proposalId: z.string().trim().min(1, "Proposta inválida."),
  toStatus: z.nativeEnum(GeneralProposalStatus, {
    errorMap: () => ({ message: "Status inválido." }),
  }),
  notes: z
    .string()
    .trim()
    .max(5000, "A observação deve ter no máximo 5.000 caracteres.")
    .optional()
    .transform((value) => value || null),
});
