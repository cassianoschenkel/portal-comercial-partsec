"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  getRequiredSession,
  requireCanAccessGeneralProposals,
} from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { vendorSchema } from "@/lib/validations/vendor";

export type VendorActionState = {
  success: boolean;
  error: string | null;
  message: string | null;
};

const vendorsPath = "/dashboard/comercial/fabricantes";

function actionError(error: string): VendorActionState {
  return { success: false, error, message: null };
}

function parseVendorForm(formData: FormData) {
  return vendorSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    logoUrl: formData.get("logoUrl"),
    websiteUrl: formData.get("websiteUrl"),
    category: formData.get("category"),
    shortDescription: formData.get("shortDescription"),
    aboutText: formData.get("aboutText"),
    internalNotes: formData.get("internalNotes"),
    isActive: formData.get("isActive") === "on",
  });
}

function isDuplicateSlugError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

async function requireVendorAccess() {
  const session = await getRequiredSession();
  requireCanAccessGeneralProposals(session);
}

export async function createVendor(
  _state: VendorActionState,
  formData: FormData
): Promise<VendorActionState> {
  await requireVendorAccess();
  const parsed = parseVendorForm(formData);

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  const existingVendor = await prisma.vendor.findUnique({
    where: { slug: parsed.data.slug },
    select: { id: true },
  });

  if (existingVendor) {
    return actionError("Já existe um fabricante com este slug.");
  }

  try {
    await prisma.vendor.create({
      data: {
        ...parsed.data,
        logoUrl: parsed.data.logoUrl || null,
        websiteUrl: parsed.data.websiteUrl || null,
        category: parsed.data.category || null,
        shortDescription: parsed.data.shortDescription || null,
        aboutText: parsed.data.aboutText || null,
        internalNotes: parsed.data.internalNotes || null,
      },
    });
  } catch (error) {
    if (isDuplicateSlugError(error)) {
      return actionError("Já existe um fabricante com este slug.");
    }

    return actionError("Não foi possível cadastrar o fabricante.");
  }

  revalidatePath(vendorsPath);
  return {
    success: true,
    error: null,
    message: "Fabricante cadastrado com sucesso.",
  };
}

export async function updateVendor(
  id: string,
  _state: VendorActionState,
  formData: FormData
): Promise<VendorActionState> {
  await requireVendorAccess();
  const parsed = parseVendorForm(formData);

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  const vendor = await prisma.vendor.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!vendor) {
    return actionError("Fabricante não encontrado.");
  }

  const duplicateSlug = await prisma.vendor.findFirst({
    where: {
      slug: parsed.data.slug,
      NOT: { id },
    },
    select: { id: true },
  });

  if (duplicateSlug) {
    return actionError("Já existe um fabricante com este slug.");
  }

  try {
    await prisma.vendor.update({
      where: { id },
      data: {
        ...parsed.data,
        logoUrl: parsed.data.logoUrl || null,
        websiteUrl: parsed.data.websiteUrl || null,
        category: parsed.data.category || null,
        shortDescription: parsed.data.shortDescription || null,
        aboutText: parsed.data.aboutText || null,
        internalNotes: parsed.data.internalNotes || null,
      },
    });
  } catch (error) {
    if (isDuplicateSlugError(error)) {
      return actionError("Já existe um fabricante com este slug.");
    }

    return actionError("Não foi possível atualizar o fabricante.");
  }

  revalidatePath(vendorsPath);
  revalidatePath(`${vendorsPath}/${id}/editar`);
  return {
    success: true,
    error: null,
    message: "Fabricante atualizado com sucesso.",
  };
}

export async function toggleVendorActive(
  id: string,
  _state: VendorActionState,
  _formData: FormData
): Promise<VendorActionState> {
  await requireVendorAccess();
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    select: { id: true, isActive: true },
  });

  if (!vendor) {
    return actionError("Fabricante não encontrado.");
  }

  try {
    await prisma.vendor.update({
      where: { id: vendor.id },
      data: { isActive: !vendor.isActive },
    });
  } catch {
    return actionError("Não foi possível alterar o status do fabricante.");
  }

  revalidatePath(vendorsPath);
  return {
    success: true,
    error: null,
    message: vendor.isActive
      ? "Fabricante inativado com sucesso."
      : "Fabricante ativado com sucesso.",
  };
}
