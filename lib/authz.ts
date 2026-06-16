import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";

export async function getRequiredSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  return session;
}

export function isAdmin(session: Session) {
  return session.user.role === "ADMIN";
}

export function isPartner(session: Session) {
  return [
    "PARTNER",
    "PARTNER_ADMIN",
    "PARTNER_SELLER",
    "PARTNER_VIEWER",
  ].includes(session.user.role);
}

export function getCurrentUserId(session: Session) {
  return session.user.id;
}

export function getEffectivePartnerId(session: Session) {
  if (isAdmin(session)) {
    return null;
  }

  if (!isPartner(session)) {
    return null;
  }

  return session.user.partnerId ?? session.user.id;
}

export function requirePartnerScope(session: Session) {
  const partnerId = getEffectivePartnerId(session);

  if (!partnerId) {
    throw new Error("Usuário parceiro sem vínculo de parceiro.");
  }

  return partnerId;
}

export async function requireAdmin() {
  const session = await getRequiredSession();

  if (!isAdmin(session)) {
    notFound();
  }

  return session;
}
