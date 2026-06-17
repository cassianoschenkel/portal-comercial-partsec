import { createHash, randomBytes } from "node:crypto";

import { UserRole } from "@prisma/client";

import { sendMail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

const INVITATION_EXPIRES_IN_HOURS = 72;

export type InvitationResult = {
  inviteUrl: string;
  emailSent: boolean;
};

export function hashInvitationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function generateInvitationToken() {
  return randomBytes(32).toString("base64url");
}

export async function createUserInvitation({
  baseUrl,
  createdById,
  email,
  isActive,
  name,
  partnerId,
  role,
}: {
  baseUrl: string;
  createdById: string;
  email: string;
  isActive: boolean;
  name: string;
  partnerId: string;
  role: UserRole;
}): Promise<InvitationResult> {
  const normalizedEmail = email.toLowerCase().trim();
  const token = generateInvitationToken();
  const tokenHash = hashInvitationToken(token);
  const expiresAt = new Date(
    Date.now() + INVITATION_EXPIRES_IN_HOURS * 60 * 60 * 1000
  );

  await prisma.userInvitation.deleteMany({
    where: {
      email: normalizedEmail,
      acceptedAt: null,
    },
  });

  await prisma.userInvitation.create({
    data: {
      email: normalizedEmail,
      name,
      role,
      partnerId,
      isActive,
      tokenHash,
      expiresAt,
      createdById,
    },
  });

  const inviteUrl = `${baseUrl.replace(/\/$/, "")}/convite/${token}`;
  const mailResult = await sendMail({
    to: normalizedEmail,
    subject: "Convite para acessar o Portal Comercial Partsec",
    text: [
      `Olá, ${name}.`,
      "",
      "Você recebeu um convite para acessar o Portal Comercial Partsec.",
      `Defina sua senha pelo link abaixo em até ${INVITATION_EXPIRES_IN_HOURS} horas:`,
      "",
      inviteUrl,
    ].join("\n"),
    html: [
      `<p>Olá, ${name}.</p>`,
      "<p>Você recebeu um convite para acessar o Portal Comercial Partsec.</p>",
      `<p>Defina sua senha em até ${INVITATION_EXPIRES_IN_HOURS} horas:</p>`,
      `<p><a href="${inviteUrl}">${inviteUrl}</a></p>`,
    ].join(""),
  });

  if (!mailResult.sent) {
    console.info("Link de convite gerado:", inviteUrl);
  }

  return {
    inviteUrl,
    emailSent: mailResult.sent,
  };
}
