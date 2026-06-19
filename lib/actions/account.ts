"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { getRequiredSession } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export type ChangePasswordState = {
  success: boolean;
  error: string | null;
  message: string | null;
};

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual."),
    newPassword: z
      .string()
      .min(8, "A nova senha deve ter ao menos 8 caracteres.")
      .regex(/[A-Za-z]/, "A nova senha deve conter pelo menos uma letra.")
      .regex(/[0-9]/, "A nova senha deve conter pelo menos um número."),
    passwordConfirmation: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((data) => data.newPassword === data.passwordConfirmation, {
    message: "A confirmação da nova senha não confere.",
    path: ["passwordConfirmation"],
  });

function actionError(error: string): ChangePasswordState {
  return { success: false, error, message: null };
}

export async function changeOwnPassword(
  _state: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await getRequiredSession();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    passwordConfirmation: formData.get("passwordConfirmation"),
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
      isActive: true,
      deletedAt: null,
    },
    select: { id: true, passwordHash: true },
  });

  if (!user) {
    return actionError("Usuário não encontrado ou inativo.");
  }

  const currentPasswordMatches = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash
  );

  if (!currentPasswordMatches) {
    return actionError("Senha atual incorreta.");
  }

  if (parsed.data.newPassword === parsed.data.currentPassword) {
    return actionError("A nova senha deve ser diferente da senha atual.");
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

  try {
    const result = await prisma.user.updateMany({
      where: {
        id: user.id,
        isActive: true,
        deletedAt: null,
      },
      data: { passwordHash },
    });

    if (result.count === 0) {
      return actionError("Usuário não encontrado ou inativo.");
    }
  } catch {
    return actionError("Não foi possível alterar a senha. Tente novamente.");
  }

  return {
    success: true,
    error: null,
    message: "Senha alterada com sucesso.",
  };
}
