"use server";

import bcrypt from "bcryptjs";
import { Prisma, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export type PartnerUserActionState = {
  success: boolean;
  error: string | null;
};

const partnerUserRoles = [
  UserRole.PARTNER_ADMIN,
  UserRole.PARTNER_SELLER,
  UserRole.PARTNER_VIEWER,
] as const;

type PartnerUserRole = (typeof partnerUserRoles)[number];

const partnerUserRoleSchema = z.string().refine(
  (role): role is PartnerUserRole =>
    partnerUserRoles.includes(role as PartnerUserRole),
  "Perfil inválido para usuário de parceiro."
);

const createPartnerUserSchema = z.object({
  name: z.string().min(2, "Nome obrigatório."),
  email: z.string().email("E-mail inválido."),
  role: partnerUserRoleSchema,
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres."),
  isActive: z.coerce.boolean().optional(),
});

const updatePartnerUserSchema = z.object({
  name: z.string().min(2, "Nome obrigatório."),
  role: partnerUserRoleSchema,
  password: z.string().optional().or(z.literal("")),
  isActive: z.coerce.boolean().optional(),
});

async function ensurePartnerExists(partnerId: string) {
  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    select: { id: true },
  });

  if (!partner) {
    notFound();
  }
}

function isDuplicateEmailError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    Array.isArray(error.meta?.target) &&
    error.meta.target.includes("email")
  );
}

function actionError(error: string): PartnerUserActionState {
  return {
    success: false,
    error,
  };
}

export async function createPartnerUser(
  partnerId: string,
  _state: PartnerUserActionState,
  formData: FormData
): Promise<PartnerUserActionState> {
  await requireAdmin();
  await ensurePartnerExists(partnerId);

  const parsed = createPartnerUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message || "Dados inválidos.");
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return actionError("Já existe um usuário com este e-mail.");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  try {
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email,
        passwordHash,
        role: parsed.data.role,
        partnerId,
        isActive: parsed.data.isActive ?? false,
      },
    });
  } catch (error) {
    if (isDuplicateEmailError(error)) {
      return actionError("Já existe um usuário com este e-mail.");
    }

    throw error;
  }

  revalidatePath(`/dashboard/parceiros/${partnerId}/usuarios`);
  redirect(`/dashboard/parceiros/${partnerId}/usuarios`);
}

export async function updatePartnerUser(
  partnerId: string,
  userId: string,
  _state: PartnerUserActionState,
  formData: FormData
): Promise<PartnerUserActionState> {
  await requireAdmin();
  await ensurePartnerExists(partnerId);

  const parsed = updatePartnerUserSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    password: formData.get("password"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message || "Dados inválidos.");
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      partnerId,
      role: { in: [...partnerUserRoles] },
    },
    select: { id: true },
  });

  if (!user) {
    notFound();
  }

  const data: {
    name: string;
    role: PartnerUserRole;
    isActive: boolean;
    passwordHash?: string;
  } = {
    name: parsed.data.name,
    role: parsed.data.role,
    isActive: parsed.data.isActive ?? false,
  };

  if (parsed.data.password) {
    data.passwordHash = await bcrypt.hash(parsed.data.password, 12);
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data,
    });
  } catch (error) {
    if (isDuplicateEmailError(error)) {
      return actionError("Já existe um usuário com este e-mail.");
    }

    throw error;
  }

  revalidatePath(`/dashboard/parceiros/${partnerId}/usuarios`);
  revalidatePath(`/dashboard/parceiros/${partnerId}/usuarios/${userId}/editar`);
  redirect(`/dashboard/parceiros/${partnerId}/usuarios`);
}
