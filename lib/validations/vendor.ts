import { z } from "zod";

function optionalUrl(message: string) {
  return z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === ""
        ? undefined
        : value,
    z
      .string()
      .trim()
      .url(message)
      .regex(/^https?:\/\//i, message)
      .optional()
  );
}

export function normalizeVendorSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const vendorSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug é obrigatório.")
    .transform(normalizeVendorSlug)
    .refine((slug) => slug.length > 0, "Slug é obrigatório."),
  logoUrl: optionalUrl("URL do logo inválida."),
  websiteUrl: optionalUrl("URL do website inválida."),
  category: z.string().trim().optional(),
  shortDescription: z.string().trim().optional(),
  aboutText: z.string().trim().optional(),
  internalNotes: z.string().trim().optional(),
  isActive: z.boolean(),
});
