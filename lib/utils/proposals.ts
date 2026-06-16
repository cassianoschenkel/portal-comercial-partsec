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
    BASIC: "Básico",
    PROFESSIONAL: "Profissional",
    ADVANCED: "Avançado",
  };

  return map[plan] ?? plan;
}

export function formatModuleType(moduleType: string) {
  const map: Record<string, string> = {
    INFRASTRUCTURE: "Infraestrutura",
    ENDPOINT_SECURITY: "Endpoint Security / Sophos Central",
    CLOUD_SERVICES: "Cloud Services / Microsoft 365",
    FIREWALL: "Firewall",
    WEB_MONITORING: "Monitoramento Web",
  };

  return map[moduleType] ?? moduleType;
}

export function formatUnitType(unitType: string) {
  const map: Record<string, string> = {
    ASSET: "ativos",
    ENDPOINT: "endpoints",
    USER: "usuários",
    FIREWALL: "firewalls",
    URL: "URLs",
    TENANT: "tenants",
  };

  return map[unitType] ?? unitType;
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
