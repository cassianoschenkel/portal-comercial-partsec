import {
  GeneralProposalStatus,
  GeneralProposalType,
} from "@prisma/client";

export const generalProposalStatusLabels: Record<
  GeneralProposalStatus,
  string
> = {
  DRAFT: "Rascunho",
  INTERNAL_REVIEW: "Revisão interna",
  APPROVED: "Aprovada",
  SENT: "Enviada",
  NEGOTIATION: "Em negociação",
  WON: "Ganha",
  LOST: "Perdida",
  CANCELLED: "Cancelada",
  EXPIRED: "Expirada",
};

export const generalProposalTypeLabels: Record<GeneralProposalType, string> = {
  NEW_SALE: "Nova venda",
  RENEWAL: "Renovação",
  UPGRADE: "Upgrade",
  REPLACEMENT: "Substituição",
  EXPANSION: "Expansão",
  IMPLEMENTATION: "Implementação",
  PROJECT: "Projeto",
  OTHER: "Outro",
};

export function getGeneralProposalStatusClasses(
  status: GeneralProposalStatus
) {
  if (status === GeneralProposalStatus.WON) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === GeneralProposalStatus.LOST) {
    return "bg-red-100 text-red-700";
  }

  if (status === GeneralProposalStatus.CANCELLED) {
    return "bg-red-50 text-red-600";
  }

  if (status === GeneralProposalStatus.EXPIRED) {
    return "bg-slate-100 text-slate-600";
  }

  if (
    status === GeneralProposalStatus.APPROVED ||
    status === GeneralProposalStatus.SENT
  ) {
    return "bg-blue-100 text-blue-700";
  }

  if (status === GeneralProposalStatus.NEGOTIATION) {
    return "bg-violet-100 text-violet-700";
  }

  if (status === GeneralProposalStatus.INTERNAL_REVIEW) {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-slate-100 text-slate-700";
}
