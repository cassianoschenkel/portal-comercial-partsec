"use server";

import bcrypt from "bcryptjs";
import { Prisma, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import {
  getRequiredSession,
  requireCanManagePartnerTeam,
} from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export type MyTeamActionState = {
  success: boolean;
  error: string | null;
};

const manageableRoles = [
  UserRole.PARTNER_SELLER,
  UserRole.PARTNER_VIEWER,
] as const;

type ManageableRole = (typeof manageableRoles)[number];

const manageableRoleSchema = z.string().refine(
  (role): role is ManageableRole =>
    manageableRoles.includes(role as ManageableRole),
  "Perfil inválido para usuário da equipe."
);

const createTeamUserSchema = z.object({
  name: z.string().min(2, "Nome obrigatório."),
  email: z.string().email("E-mail inválido."),
  role: manageableRoleSchema,
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres."),
  isActive: z.coerce.boolean().optional(),
});

const updateTeamUserSchema = z.object({
  name: z.string().min(2, "Nome obrigatório."),
  role: manageableRoleSchema,
  password: z.string().optional().or(z.literal("")),
  isActive: z.coerce.boolean().optional(),
});

function actionError(error: string): MyTeamActionState {
  return {
    success: false,
    error,
  };
}

function isDuplicateEmailError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    Array.isArray(error.meta?.target) &&
    error.meta.target.includes("email")
  );
}

async function requireTeamManagerScope() {
  const session = await getRequiredSession();
  requireCanManagePartnerTeam(session);

  if (!session.user.partnerId) {
    notFound();
  }

  return {
    currentUserId: session.user.id,
    partnerId: session.user.partnerId,
  };
}

export async function createMyTeamUser(
  _state: MyTeamActionState,
  formData: FormData
): Promise<MyTeamActionState> {
  const { partnerId } = await requireTeamManagerScope();

  const parsed = createTeamUserSchema.safeParse({
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

  revalidatePath("/dashboard/equipe");
  redirect("/dashboard/equipe");
}

export async function updateMyTeamUser(
  userId: string,
  _state: MyTeamActionState,
  formData: FormData
): Promise<MyTeamActionState> {
  const { currentUserId, partnerId } = await requireTeamManagerScope();

  if (userId === currentUserId) {
    return actionError("Você não pode alterar seu próprio acesso por esta tela.");
  }

  const parsed = updateTeamUserSchema.safeParse({
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
      role: { in: [...manageableRoles] },
    },
    select: { id: true },
  });

  if (!user) {
    notFound();
  }

  const data: {
    name: string;
    role: ManageableRole;
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

  revalidatePath("/dashboard/equipe");
  revalidatePath(`/dashboard/equipe/${userId}/editar`);
  redirect("/dashboard/equipe");
}
