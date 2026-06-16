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
  return session.user.role === "PARTNER";
}

export function getCurrentUserId(session: Session) {
  return session.user.id;
}

export async function requireAdmin() {
  const session = await getRequiredSession();

  if (!isAdmin(session)) {
    notFound();
  }

  return session;
}
