"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";

import { hashInvitationToken } from "@/lib/invitations";
import { prisma } from "@/lib/prisma";

export type AcceptInvitationState = {
  success: boolean;
  error: string | null;
};

const acceptInvitationSchema = z
  .object({
    password: z.string().min(8, "Senha deve ter ao menos 8 caracteres."),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "A confirmação de senha não confere.",
    path: ["passwordConfirmation"],
  });

function actionError(error: string): AcceptInvitationState {
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

export async function acceptInvitation(
  token: string,
  _state: AcceptInvitationState,
  formData: FormData
): Promise<AcceptInvitationState> {
  const parsed = acceptInvitationSchema.safeParse({
    password: formData.get("password"),
    passwordConfirmation: formData.get("passwordConfirmation"),
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message || "Dados inválidos.");
  }

  const tokenHash = hashInvitationToken(token);
  const now = new Date();
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  try {
    await prisma.$transaction(async (tx) => {
      const invitation = await tx.userInvitation.findUnique({
        where: { tokenHash },
      });

      if (!invitation || invitation.acceptedAt || invitation.expiresAt <= now) {
        throw new Error("INVITATION_INVALID");
      }

      const existingUser = await tx.user.findUnique({
        where: { email: invitation.email },
        select: { id: true },
      });

      if (existingUser) {
        throw new Error("USER_EXISTS");
      }

      await tx.user.create({
        data: {
          name: invitation.name,
          email: invitation.email,
          passwordHash,
          role: invitation.role,
          partnerId: invitation.partnerId,
          isActive: invitation.isActive,
        },
      });

      await tx.userInvitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: now },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVITATION_INVALID") {
      return actionError("Convite inválido, expirado ou já utilizado.");
    }

    if (error instanceof Error && error.message === "USER_EXISTS") {
      return actionError("Já existe um usuário com este e-mail.");
    }

    if (isDuplicateEmailError(error)) {
      return actionError("Já existe um usuário com este e-mail.");
    }

    throw error;
  }

  redirect("/login?convite=aceito");
}
