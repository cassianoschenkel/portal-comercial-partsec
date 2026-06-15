export const PROPOSAL_PLAN_OPTIONS = [
  { value: "BASIC", label: "Basic" },
  { value: "PROFESSIONAL", label: "Professional" },
  { value: "ADVANCED", label: "Advanced" },
] as const;

export const PROPOSAL_MODULE_OPTIONS = [
  {
    value: "INFRASTRUCTURE",
    label: "Infraestrutura",
    unitLabel: "ativos",
  },
  {
    value: "ENDPOINT_SECURITY",
    label: "Endpoint Security / Sophos Central",
    unitLabel: "endpoints",
  },
  {
    value: "CLOUD_SERVICES",
    label: "Cloud Services / Microsoft 365",
    unitLabel: "usuarios",
  },
] as const;

export type ProposalPlanOptionValue =
  (typeof PROPOSAL_PLAN_OPTIONS)[number]["value"];

export type ProposalModuleOptionValue =
  (typeof PROPOSAL_MODULE_OPTIONS)[number]["value"];

export function getProposalModuleOption(moduleType: string) {
  return PROPOSAL_MODULE_OPTIONS.find((option) => option.value === moduleType);
}
