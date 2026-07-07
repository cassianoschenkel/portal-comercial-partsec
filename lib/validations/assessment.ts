import { AssessmentType } from "@prisma/client";
import { z } from "zod";

import { ASSESSMENT_SECTIONS } from "@/lib/assessments/catalog";

export const createAssessmentSchema = z.object({
  customerId: z.string().min(1, "Cliente obrigatório."),
  title: z.string().min(3, "Título obrigatório."),
  type: z.nativeEnum(AssessmentType),
  validityDays: z.coerce
    .number()
    .int("Validade inválida.")
    .min(1, "Validade mínima de 1 dia.")
    .max(180, "Validade máxima de 180 dias."),
  internalNotes: z.string().optional().or(z.literal("")),
});

export function parsePublicAssessmentAnswers(formData: FormData) {
  const answers: Record<string, Record<string, string>> = {};

  for (const section of ASSESSMENT_SECTIONS) {
    answers[section.key] = {};

    for (const question of section.questions) {
      const rawValue = formData.get(question.name);
      const value = typeof rawValue === "string" ? rawValue.trim() : "";
      const fieldKey = question.name.split(".")[1];

      if (question.required && !value) {
        throw new Error(`${question.label} é obrigatório.`);
      }

      if (question.type === "number" && value && Number(value) < 0) {
        throw new Error(`${question.label} não pode ser negativo.`);
      }

      if (fieldKey) {
        answers[section.key][fieldKey] = value;
      }
    }
  }

  const responsible = answers.responsavel ?? {};

  if (!responsible.email || !z.string().email().safeParse(responsible.email).success) {
    throw new Error("E-mail do responsável inválido.");
  }

  return {
    answers,
    submittedByName: responsible.nome || null,
    submittedByEmail: responsible.email || null,
    submittedByPhone: responsible.telefone || null,
  };
}
