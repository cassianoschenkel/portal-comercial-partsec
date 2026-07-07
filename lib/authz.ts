import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getRequiredSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      isActive: true,
      deletedAt: true,
      role: true,
      partnerId: true,
    },
  });

  if (!user || !user.isActive || user.deletedAt) {
    redirect("/login");
  }

  session.user.role = user.role;
  session.user.partnerId = user.partnerId;

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

export function isPartnerAdmin(session: Session) {
  return ["PARTNER", "PARTNER_ADMIN"].includes(session.user.role);
}

export function isPartnerSeller(session: Session) {
  return session.user.role === "PARTNER_SELLER";
}

export function isPartnerViewer(session: Session) {
  return session.user.role === "PARTNER_VIEWER";
}

export function canManagePartnerTeam(session: Session) {
  return isPartnerAdmin(session);
}

export function canWriteCommercialData(session: Session) {
  return isAdmin(session) || isPartnerAdmin(session) || isPartnerSeller(session);
}

export function canCreateProposal(session: Session) {
  return canWriteCommercialData(session);
}

export function canUpdateProposal(session: Session) {
  return canWriteCommercialData(session);
}

export function canDeleteProposal(session: Session) {
  return isAdmin(session) || isPartnerAdmin(session);
}

export function canAccessGeneralProposals(session: Session) {
  return isAdmin(session);
}

export function canCreateCustomer(session: Session) {
  return canWriteCommercialData(session);
}

export function canUpdateCustomer(session: Session) {
  return canWriteCommercialData(session);
}

export function canCreateAssessment(session: Session) {
  return canWriteCommercialData(session);
}

export function canManageAssessmentLink(session: Session) {
  return canWriteCommercialData(session);
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

export function requireCanManagePartnerTeam(session: Session) {
  if (!canManagePartnerTeam(session)) {
    notFound();
  }
}

export function requireCanWriteCommercialData(session: Session) {
  if (!canWriteCommercialData(session)) {
    notFound();
  }
}

export function requireCanCreateProposal(session: Session) {
  if (!canCreateProposal(session)) {
    notFound();
  }
}

export function requireCanUpdateProposal(session: Session) {
  if (!canUpdateProposal(session)) {
    notFound();
  }
}

export function requireCanAccessGeneralProposals(session: Session) {
  if (!canAccessGeneralProposals(session)) {
    notFound();
  }
}

export function requireCanCreateCustomer(session: Session) {
  if (!canCreateCustomer(session)) {
    notFound();
  }
}

export function requireCanUpdateCustomer(session: Session) {
  if (!canUpdateCustomer(session)) {
    notFound();
  }
}

export function requireCanCreateAssessment(session: Session) {
  if (!canCreateAssessment(session)) {
    notFound();
  }
}

export function requireCanManageAssessmentLink(session: Session) {
  if (!canManageAssessmentLink(session)) {
    notFound();
  }
}
