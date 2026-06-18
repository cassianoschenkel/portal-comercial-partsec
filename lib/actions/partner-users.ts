"use server";

import bcrypt from "bcryptjs";
import { Prisma, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/authz";
import {
  createUserInvitation,
  refreshInvitationToken,
} from "@/lib/invitations";
import { prisma } from "@/lib/prisma";

export type PartnerUserActionState = {
  success: boolean;
  error: string | null;
  message?: string | null;
  inviteUrl?: string | null;
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

async function getRequestBaseUrl() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${protocol}://${host}`;
  }

  return (
    process.env.NEXTAUTH_URL ??
    process.env.APP_URL ??
    "http://localhost:3000"
  );
}

export async function createPartnerUser(
  partnerId: string,
  _state: PartnerUserActionState,
  formData: FormData
): Promise<PartnerUserActionState> {
  const session = await requireAdmin();
  await ensurePartnerExists(partnerId);

  const parsed = createPartnerUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
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

  const invitation = await createUserInvitation({
    baseUrl: await getRequestBaseUrl(),
    createdById: session.user.id,
    email,
    isActive: parsed.data.isActive ?? false,
    name: parsed.data.name,
    partnerId,
    role: parsed.data.role,
  });

  revalidatePath(`/dashboard/parceiros/${partnerId}/usuarios`);
  return {
    success: true,
    error: null,
    message: invitation.emailSent
      ? "Convite enviado por e-mail."
      : "Convite criado. SMTP não configurado; use o link abaixo para teste.",
    inviteUrl: invitation.emailSent ? null : invitation.inviteUrl,
  };
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

export async function cancelPartnerInvitation(
  partnerId: string,
  invitationId: string,
  _state: PartnerUserActionState,
  _formData: FormData
): Promise<PartnerUserActionState> {
  const session = await requireAdmin();
  await ensurePartnerExists(partnerId);

  const invitation = await prisma.userInvitation.findFirst({
    where: {
      id: invitationId,
      partnerId,
    },
    select: {
      id: true,
      acceptedAt: true,
      canceledAt: true,
    },
  });

  if (!invitation) {
    notFound();
  }

  if (invitation.acceptedAt) {
    return actionError("Convite aceito não pode ser cancelado.");
  }

  if (invitation.canceledAt) {
    return actionError("Convite já está cancelado.");
  }

  await prisma.userInvitation.update({
    where: { id: invitation.id },
    data: {
      canceledAt: new Date(),
      canceledById: session.user.id,
    },
  });

  revalidatePath(`/dashboard/parceiros/${partnerId}/usuarios`);
  return {
    success: true,
    error: null,
    message: "Convite cancelado.",
  };
}

export async function resendPartnerInvitation(
  partnerId: string,
  invitationId: string,
  _state: PartnerUserActionState,
  _formData: FormData
): Promise<PartnerUserActionState> {
  await requireAdmin();
  await ensurePartnerExists(partnerId);

  const invitation = await prisma.userInvitation.findFirst({
    where: {
      id: invitationId,
      partnerId,
    },
    select: {
      id: true,
      acceptedAt: true,
      canceledAt: true,
    },
  });

  if (!invitation) {
    notFound();
  }

  if (invitation.acceptedAt) {
    return actionError("Convite aceito não pode ser reenviado.");
  }

  if (invitation.canceledAt) {
    return actionError("Convite cancelado não pode ser reenviado.");
  }

  const result = await refreshInvitationToken({
    baseUrl: await getRequestBaseUrl(),
    invitationId: invitation.id,
  });

  revalidatePath(`/dashboard/parceiros/${partnerId}/usuarios`);
  return {
    success: true,
    error: null,
    message: result.emailSent
      ? "Convite reenviado por e-mail."
      : "Convite reenviado. SMTP não configurado; use o link abaixo para teste.",
    inviteUrl: result.emailSent ? null : result.inviteUrl,
  };
}
