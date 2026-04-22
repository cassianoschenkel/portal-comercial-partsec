export function formatProposalNumber(
  proposalNumber: number,
  createdAt?: Date | string
) {
  const year = createdAt
    ? new Date(createdAt).getFullYear()
    : new Date().getFullYear();

  return `P-${year}-${String(proposalNumber).padStart(6, "0")}`;
}

export function formatProposalPlan(plan: string) {
  const map: Record<string, string> = {
    ESSENTIAL: "Essential",
    PROFESSIONAL: "Professional",
    ENTERPRISE: "Enterprise",
  };

  return map[plan] ?? plan;
}

export function formatProposalStatus(status: string) {
  const map: Record<string, string> = {
    DRAFT: "Rascunho",
    SENT: "Enviada",
    ACCEPTED: "Aceita",
    REJECTED: "Rejeitada",
    CANCELLED: "Cancelada",
  };

  return map[status] ?? status;
}

export function getProposalStatusBadgeClasses(status: string) {
  const map: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-700",
    SENT: "bg-blue-100 text-blue-700",
    ACCEPTED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-amber-100 text-amber-700",
  };

  return map[status] ?? "bg-slate-100 text-slate-700";
}
