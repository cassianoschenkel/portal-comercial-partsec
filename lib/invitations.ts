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

function buildInviteUrl(baseUrl: string, token: string) {
  return `${baseUrl.replace(/\/$/, "")}/convite/${token}`;
}

async function sendInvitationEmail({
  baseUrl,
  email,
  name,
  token,
}: {
  baseUrl: string;
  email: string;
  name: string;
  token: string;
}) {
  const inviteUrl = buildInviteUrl(baseUrl, token);
  const validityText = `${INVITATION_EXPIRES_IN_HOURS} horas`;
  const mailResult = await sendMail({
    to: email,
    subject: "Convite para acessar o Portal Comercial Partsec",
    text: [
      `Olá, ${name}.`,
      "",
      "Você recebeu um convite para acessar o Portal Comercial Partsec.",
      `Para definir sua senha e acessar o portal, use o link abaixo em até ${validityText}:`,
      "",
      inviteUrl,
      "",
      "Se o link não abrir ao clicar, copie e cole o endereço no navegador.",
      "",
      "Partsec",
    ].join("\n"),
    html: [
      '<div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;max-width:560px">',
      '<p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;font-weight:700">Partsec</p>',
      '<h1 style="font-size:22px;margin:8px 0 16px">Convite para o Portal Comercial</h1>',
      `<p>Olá, <strong>${name}</strong>.</p>`,
      "<p>Você recebeu um convite para acessar o Portal Comercial Partsec.</p>",
      `<p>Este convite é válido por <strong>${validityText}</strong>.</p>`,
      `<p style="margin:24px 0"><a href="${inviteUrl}" style="background:#0f172a;color:#ffffff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:700">Definir senha</a></p>`,
      "<p>Se o botão não funcionar, copie e cole este link no navegador:</p>",
      `<p><a href="${inviteUrl}" style="color:#2563eb">${inviteUrl}</a></p>`,
      '<p style="margin-top:28px;color:#475569">Atenciosamente,<br/>Partsec</p>',
      "</div>",
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
  const now = new Date();

  await prisma.userInvitation.updateMany({
    where: {
      email: normalizedEmail,
      acceptedAt: null,
      canceledAt: null,
    },
    data: {
      canceledAt: now,
      canceledById: createdById,
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
      canceledAt: null,
      createdById,
    },
  });

  return sendInvitationEmail({
    baseUrl,
    email: normalizedEmail,
    name,
    token,
  });
}

export async function refreshInvitationToken({
  baseUrl,
  invitationId,
}: {
  baseUrl: string;
  invitationId: string;
}): Promise<InvitationResult> {
  const token = generateInvitationToken();
  const tokenHash = hashInvitationToken(token);
  const expiresAt = new Date(
    Date.now() + INVITATION_EXPIRES_IN_HOURS * 60 * 60 * 1000
  );

  const invitation = await prisma.userInvitation.update({
    where: { id: invitationId },
    data: {
      tokenHash,
      expiresAt,
    },
    select: {
      email: true,
      name: true,
    },
  });

  return sendInvitationEmail({
    baseUrl,
    email: invitation.email,
    name: invitation.name,
    token,
  });
}
