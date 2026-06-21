"use server";

import { GeneralProposalStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  getRequiredSession,
  requireCanAccessGeneralProposals,
} from "@/lib/authz";
import {
  calculateGeneralProposalService,
  recalculateGeneralProposalTotals,
} from "@/lib/general-proposals/calculations";
import { prisma } from "@/lib/prisma";
import { generalProposalServiceSchema } from "@/lib/validations/general-proposal-service";

export type GeneralProposalServiceActionState = {
  success: boolean;
  error: string | null;
  message: string | null;
};

const editableStatuses: GeneralProposalStatus[] = [
  GeneralProposalStatus.DRAFT,
  GeneralProposalStatus.INTERNAL_REVIEW,
];

type ParsedService = ReturnType<typeof parseServiceForm>;

function actionError(error: string): GeneralProposalServiceActionState {
  return { success: false, error, message: null };
}

function parseServiceForm(formData: FormData) {
  return generalProposalServiceSchema.safeParse({
    serviceName: formData.get("serviceName"),
    description: formData.get("description") || undefined,
    serviceType: formData.get("serviceType"),
    pricingMode: formData.get("pricingMode"),
    estimatedHours: formData.get("estimatedHours"),
    internalHourlyCost: formData.get("internalHourlyCost"),
    saleHourlyRate: formData.get("saleHourlyRate"),
    fixedCost: formData.get("fixedCost"),
    fixedSalePrice: formData.get("fixedSalePrice"),
    isVisibleToClient: formData.get("isVisibleToClient") === "on",
    internalNotes: formData.get("internalNotes") || undefined,
    sortOrder: formData.get("sortOrder") || "0",
  });
}

async function requireServiceAccess() {
  const session = await getRequiredSession();
  requireCanAccessGeneralProposals(session);
}

function getProposalError(
  proposal: { status: GeneralProposalStatus } | null
) {
  if (!proposal) return "Proposta geral não encontrada.";
  if (!editableStatuses.includes(proposal.status)) {
    return "Os serviços só podem ser alterados em propostas em rascunho ou revisão interna.";
  }
  return null;
}

function serviceData(
  parsed: Extract<ParsedService, { success: true }>["data"]
) {
  const calculated = calculateGeneralProposalService({
    pricingMode: parsed.pricingMode,
    estimatedHours: parsed.estimatedHours,
    internalHourlyCost: parsed.internalHourlyCost,
    saleHourlyRate: parsed.saleHourlyRate,
    fixedCost: parsed.fixedCost,
    fixedSalePrice: parsed.fixedSalePrice,
  });

  return {
    serviceName: parsed.serviceName,
    description: parsed.description || null,
    serviceType: parsed.serviceType,
    pricingMode: parsed.pricingMode,
    estimatedHours: calculated.estimatedHours,
    internalHourlyCost: calculated.internalHourlyCost,
    saleHourlyRate: calculated.saleHourlyRate,
    fixedCost: calculated.fixedCost,
    fixedSalePrice: calculated.fixedSalePrice,
    totalCost: calculated.totalCost,
    totalSalePrice: calculated.totalSalePrice,
    grossProfit: calculated.grossProfit,
    grossMarginPercent: calculated.grossMarginPercent,
    isVisibleToClient: parsed.isVisibleToClient,
    internalNotes: parsed.internalNotes || null,
    sortOrder: parsed.sortOrder,
  };
}

function revalidateProposal(proposalId: string) {
  revalidatePath(`/dashboard/comercial/propostas-gerais/${proposalId}`);
  revalidatePath("/dashboard/comercial/propostas-gerais");
}

export async function createGeneralProposalService(
  proposalId: string,
  _state: GeneralProposalServiceActionState,
  formData: FormData
): Promise<GeneralProposalServiceActionState> {
  await requireServiceAccess();
  const parsed = parseServiceForm(formData);

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const proposal = await tx.generalProposal.findFirst({
        where: { id: proposalId, deletedAt: null },
        select: { id: true, status: true },
      });
      const proposalError = getProposalError(proposal);
      if (proposalError || !proposal) return actionError(proposalError!);

      await tx.generalProposalService.create({
        data: {
          proposalId: proposal.id,
          ...serviceData(parsed.data),
        },
      });
      await recalculateGeneralProposalTotals(tx, proposal.id);
      return {
        success: true,
        error: null,
        message: "Serviço adicionado com sucesso.",
      };
    });

    if (!result.success) return result;
  } catch {
    return actionError("Não foi possível adicionar o serviço.");
  }

  revalidateProposal(proposalId);
  return {
    success: true,
    error: null,
    message: "Serviço adicionado com sucesso.",
  };
}

export async function updateGeneralProposalService(
  proposalId: string,
  serviceId: string,
  _state: GeneralProposalServiceActionState,
  formData: FormData
): Promise<GeneralProposalServiceActionState> {
  await requireServiceAccess();
  const parsed = parseServiceForm(formData);

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const proposal = await tx.generalProposal.findFirst({
        where: { id: proposalId, deletedAt: null },
        select: { id: true, status: true },
      });
      const proposalError = getProposalError(proposal);
      if (proposalError || !proposal) return actionError(proposalError!);

      const service = await tx.generalProposalService.findFirst({
        where: { id: serviceId, proposalId: proposal.id },
        select: { id: true },
      });
      if (!service) return actionError("Serviço não encontrado nesta proposta.");

      await tx.generalProposalService.update({
        where: { id: service.id },
        data: serviceData(parsed.data),
      });
      await recalculateGeneralProposalTotals(tx, proposal.id);
      return {
        success: true,
        error: null,
        message: "Serviço atualizado com sucesso.",
      };
    });

    if (!result.success) return result;
  } catch {
    return actionError("Não foi possível atualizar o serviço.");
  }

  revalidateProposal(proposalId);
  return {
    success: true,
    error: null,
    message: "Serviço atualizado com sucesso.",
  };
}

export async function deleteGeneralProposalService(
  proposalId: string,
  serviceId: string,
  _state: GeneralProposalServiceActionState,
  _formData: FormData
): Promise<GeneralProposalServiceActionState> {
  await requireServiceAccess();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const proposal = await tx.generalProposal.findFirst({
        where: { id: proposalId, deletedAt: null },
        select: { id: true, status: true },
      });
      const proposalError = getProposalError(proposal);
      if (proposalError || !proposal) return actionError(proposalError!);

      const service = await tx.generalProposalService.findFirst({
        where: { id: serviceId, proposalId: proposal.id },
        select: { id: true },
      });
      if (!service) return actionError("Serviço não encontrado nesta proposta.");

      await tx.generalProposalService.delete({ where: { id: service.id } });
      await recalculateGeneralProposalTotals(tx, proposal.id);
      return {
        success: true,
        error: null,
        message: "Serviço removido com sucesso.",
      };
    });

    if (!result.success) return result;
  } catch {
    return actionError("Não foi possível remover o serviço.");
  }

  revalidateProposal(proposalId);
  return {
    success: true,
    error: null,
    message: "Serviço removido com sucesso.",
  };
}
