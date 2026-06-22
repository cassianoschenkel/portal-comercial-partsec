"use server";

import { GeneralProposalStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  getRequiredSession,
  requireCanAccessGeneralProposals,
} from "@/lib/authz";
import { generateGeneralProposalNumber } from "@/lib/general-proposals/numbering";
import { prisma } from "@/lib/prisma";
import {
  createGeneralProposalSchema,
  updateGeneralProposalSchema,
} from "@/lib/validations/general-proposal";
import { updateGeneralProposalStatusSchema } from "@/lib/validations/general-proposal-status";

export type GeneralProposalActionState = {
  success: boolean;
  error: string | null;
  message: string | null;
};

function actionError(error: string): GeneralProposalActionState {
  return { success: false, error, message: null };
}

function actionSuccess(message: string): GeneralProposalActionState {
  return { success: true, error: null, message };
}

const finalStatuses = new Set<GeneralProposalStatus>([
  GeneralProposalStatus.WON,
  GeneralProposalStatus.LOST,
  GeneralProposalStatus.CANCELLED,
  GeneralProposalStatus.EXPIRED,
]);

export async function createGeneralProposal(
  _state: GeneralProposalActionState,
  formData: FormData
): Promise<GeneralProposalActionState> {
  const session = await getRequiredSession();
  requireCanAccessGeneralProposals(session);

  const parsed = createGeneralProposalSchema.safeParse({
    customerId: formData.get("customerId"),
    vendorId: formData.get("vendorId"),
    proposalType: formData.get("proposalType"),
    title: formData.get("title"),
    licenseTermMonths: formData.get("licenseTermMonths"),
    validUntil: formData.get("validUntil"),
    currency: formData.get("currency") || "BRL",
    paymentTerms: formData.get("paymentTerms"),
    executiveSummary: formData.get("executiveSummary"),
    projectScope: formData.get("projectScope"),
    commercialNotes: formData.get("commercialNotes"),
    internalNotes: formData.get("internalNotes"),
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  const [customer, vendor] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: parsed.data.customerId },
      select: { id: true },
    }),
    prisma.vendor.findUnique({
      where: { id: parsed.data.vendorId },
      select: { id: true, isActive: true },
    }),
  ]);

  if (!customer) {
    return actionError("Cliente não encontrado.");
  }

  if (!vendor) {
    return actionError("Fabricante não encontrado.");
  }

  if (!vendor.isActive) {
    return actionError("O fabricante selecionado está inativo.");
  }

  let proposalId: string;

  try {
    const proposal = await prisma.$transaction(async (tx) => {
      const proposalNumber = await generateGeneralProposalNumber(tx);

      return tx.generalProposal.create({
        data: {
          proposalNumber,
          title: parsed.data.title,
          customerId: customer.id,
          vendorId: vendor.id,
          createdByUserId: session.user.id,
          status: GeneralProposalStatus.DRAFT,
          proposalType: parsed.data.proposalType,
          currency: parsed.data.currency,
          licenseTermMonths: parsed.data.licenseTermMonths ?? null,
          validUntil: parsed.data.validUntil ?? null,
          paymentTerms: parsed.data.paymentTerms ?? null,
          executiveSummary: parsed.data.executiveSummary ?? null,
          projectScope: parsed.data.projectScope ?? null,
          commercialNotes: parsed.data.commercialNotes ?? null,
          internalNotes: parsed.data.internalNotes ?? null,
          subtotalProducts: 0,
          subtotalServices: 0,
          totalCost: 0,
          totalSalePrice: 0,
          totalDiscount: 0,
          finalPrice: 0,
          grossProfit: 0,
          grossMarginPercent: 0,
          markupPercent: 0,
        },
        select: { id: true },
      });
    });

    proposalId = proposal.id;
  } catch {
    return actionError("Não foi possível criar a proposta geral.");
  }

  revalidatePath("/dashboard/comercial/propostas-gerais");
  redirect(`/dashboard/comercial/propostas-gerais/${proposalId}`);
}

export async function updateGeneralProposal(
  _state: GeneralProposalActionState,
  formData: FormData
): Promise<GeneralProposalActionState> {
  const session = await getRequiredSession();
  requireCanAccessGeneralProposals(session);

  const parsed = updateGeneralProposalSchema.safeParse({
    proposalId: formData.get("proposalId"),
    vendorId: formData.get("vendorId"),
    proposalType: formData.get("proposalType"),
    title: formData.get("title"),
    licenseTermMonths: formData.get("licenseTermMonths"),
    validUntil: formData.get("validUntil"),
    paymentTerms: formData.get("paymentTerms"),
    executiveSummary: formData.get("executiveSummary"),
    projectScope: formData.get("projectScope"),
    commercialNotes: formData.get("commercialNotes"),
    internalNotes: formData.get("internalNotes"),
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  const [proposal, vendor] = await Promise.all([
    prisma.generalProposal.findUnique({
      where: { id: parsed.data.proposalId },
      select: { id: true, vendorId: true, deletedAt: true },
    }),
    prisma.vendor.findUnique({
      where: { id: parsed.data.vendorId },
      select: { id: true, isActive: true },
    }),
  ]);

  if (!proposal || proposal.deletedAt) {
    return actionError("Proposta geral não encontrada ou excluída.");
  }

  if (!vendor) {
    return actionError("Fabricante não encontrado.");
  }

  if (!vendor.isActive && vendor.id !== proposal.vendorId) {
    return actionError("O fabricante selecionado está inativo.");
  }

  try {
    const updated = await prisma.generalProposal.updateMany({
      where: { id: proposal.id, deletedAt: null },
      data: {
        title: parsed.data.title,
        vendorId: vendor.id,
        proposalType: parsed.data.proposalType,
        licenseTermMonths: parsed.data.licenseTermMonths ?? null,
        validUntil: parsed.data.validUntil ?? null,
        paymentTerms: parsed.data.paymentTerms ?? null,
        executiveSummary: parsed.data.executiveSummary ?? null,
        projectScope: parsed.data.projectScope ?? null,
        commercialNotes: parsed.data.commercialNotes ?? null,
        internalNotes: parsed.data.internalNotes ?? null,
      },
    });

    if (updated.count !== 1) {
      return actionError("A proposta foi excluída durante a edição. Atualize a página.");
    }
  } catch {
    return actionError("Não foi possível atualizar a proposta geral.");
  }

  revalidatePath("/dashboard/comercial/propostas-gerais");
  revalidatePath(`/dashboard/comercial/propostas-gerais/${proposal.id}`);
  redirect(`/dashboard/comercial/propostas-gerais/${proposal.id}`);
}

export async function updateGeneralProposalStatus(
  _state: GeneralProposalActionState,
  formData: FormData
): Promise<GeneralProposalActionState> {
  const session = await getRequiredSession();
  requireCanAccessGeneralProposals(session);

  const parsed = updateGeneralProposalStatusSchema.safeParse({
    proposalId: formData.get("proposalId"),
    toStatus: formData.get("toStatus"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const proposal = await tx.generalProposal.findFirst({
        where: { id: parsed.data.proposalId, deletedAt: null },
        select: {
          id: true,
          status: true,
          sentAt: true,
          approvedAt: true,
          closedAt: true,
        },
      });

      if (!proposal) {
        return { error: "Proposta geral não encontrada." } as const;
      }

      if (proposal.status === parsed.data.toStatus) {
        return { error: "A proposta já está com o status selecionado." } as const;
      }

      const now = new Date();
      const updateData: {
        status: GeneralProposalStatus;
        sentAt?: Date;
        approvedAt?: Date;
        closedAt?: Date;
      } = { status: parsed.data.toStatus };

      if (parsed.data.toStatus === GeneralProposalStatus.SENT && !proposal.sentAt) {
        updateData.sentAt = now;
      }

      if (
        parsed.data.toStatus === GeneralProposalStatus.APPROVED &&
        !proposal.approvedAt
      ) {
        updateData.approvedAt = now;
      }

      if (finalStatuses.has(parsed.data.toStatus) && !proposal.closedAt) {
        updateData.closedAt = now;
      }

      const updated = await tx.generalProposal.updateMany({
        where: {
          id: proposal.id,
          deletedAt: null,
          status: proposal.status,
        },
        data: updateData,
      });

      if (updated.count !== 1) {
        return {
          error: "O status da proposta foi alterado por outro usuário. Atualize a página e tente novamente.",
        } as const;
      }

      await tx.generalProposalStatusHistory.create({
        data: {
          proposalId: proposal.id,
          fromStatus: proposal.status,
          toStatus: parsed.data.toStatus,
          changedByUserId: session.user.id,
          notes: parsed.data.notes,
        },
      });

      return { error: null } as const;
    });

    if (result.error) {
      return actionError(result.error);
    }
  } catch {
    return actionError("Não foi possível atualizar o status da proposta.");
  }

  revalidatePath("/dashboard/comercial/propostas-gerais");
  revalidatePath(`/dashboard/comercial/propostas-gerais/${parsed.data.proposalId}`);
  return actionSuccess("Status atualizado com sucesso.");
}
