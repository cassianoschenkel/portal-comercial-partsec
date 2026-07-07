import type { Session } from "next-auth";

import { getEffectivePartnerId, isAdmin } from "@/lib/authz";

export function assessmentScopeWhere(session: Session) {
  if (isAdmin(session)) {
    return {};
  }

  return { partnerId: getEffectivePartnerId(session) ?? "" };
}
