"use server";

import {
  GeneralPricingMode,
  GeneralProposalStatus,
  Prisma,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  getRequiredSession,
  requireCanAccessGeneralProposals,
} from "@/lib/authz";
import {
  calculateGeneralProposalItem,
  recalculateGeneralProposalTotals,
} from "@/lib/general-proposals/calculations";
import { prisma } from "@/lib/prisma";
import { generalProposalItemSchema } from "@/lib/validations/general-proposal-item";

export type GeneralProposalItemActionState = {
  success: boolean;
  error: string | null;
  message: string | null;
};

const editableStatuses: GeneralProposalStatus[] = [
  GeneralProposalStatus.DRAFT,
  GeneralProposalStatus.INTERNAL_REVIEW,
];

type ParsedItem = ReturnType<typeof parseItemForm>;

function actionError(error: string): GeneralProposalItemActionState {
  return { success: false, error, message: null };
}

function parseItemForm(formData: FormData) {
  return generalProposalItemSchema.safeParse({
    vendorId: formData.get("vendorId") || undefined,
    sku: formData.get("sku") || undefined,
    productName: formData.get("productName"),
    description: formData.get("description") || undefined,
    category: formData.get("category") || undefined,
    quantity: formData.get("quantity"),
    licenseTermMonths: formData.get("licenseTermMonths"),
    costUnitPrice: formData.get("costUnitPrice"),
    listUnitPrice: formData.get("listUnitPrice"),
    pricingMode: formData.get("pricingMode"),
    marginPercent: formData.get("marginPercent"),
    markupPercent: formData.get("markupPercent"),
    discountPercent: formData.get("discountPercent"),
    saleUnitPrice: formData.get("saleUnitPrice") || undefined,
    isVisibleToClient: formData.get("isVisibleToClient") === "on",
    sortOrder: formData.get("sortOrder") || "0",
    internalNotes: formData.get("internalNotes") || undefined,
  });
}

async function requireItemAccess() {
  const session = await getRequiredSession();
  requireCanAccessGeneralProposals(session);
}

function getProposalError(
  proposal: { status: GeneralProposalStatus } | null
) {
  if (!proposal) return "Proposta geral não encontrada.";
  if (!editableStatuses.includes(proposal.status)) {
    return "Os produtos só podem ser alterados em propostas em rascunho ou revisão interna.";
  }
  return null;
}

function itemData(
  parsed: Extract<ParsedItem, { success: true }>["data"],
  proposal: {
    vendorId: string;
    licenseTermMonths: number | null;
  },
  vendorId: string
) {
  const calculated = calculateGeneralProposalItem({
    quantity: parsed.quantity,
    costUnitPrice: parsed.costUnitPrice,
    pricingMode: parsed.pricingMode,
    marginPercent: parsed.marginPercent,
    markupPercent: parsed.markupPercent,
    discountPercent: parsed.discountPercent,
    manualSaleUnitPrice: parsed.saleUnitPrice,
  });

  return {
    vendorId,
    sku: parsed.sku || null,
    productName: parsed.productName,
    description: parsed.description || null,
    category: parsed.category || null,
    quantity: calculated.quantity,
    licenseTermMonths:
      parsed.licenseTermMonths ?? proposal.licenseTermMonths ?? null,
    costUnitPrice: calculated.costUnitPrice,
    listUnitPrice: new Prisma.Decimal(parsed.listUnitPrice).toDecimalPlaces(
      2,
      Prisma.Decimal.ROUND_HALF_UP
    ),
    pricingMode: parsed.pricingMode,
    marginPercent: calculated.marginPercent,
    markupPercent: calculated.markupPercent,
    discountPercent: calculated.discountPercent,
    saleUnitPrice: calculated.saleUnitPrice,
    totalCost: calculated.totalCost,
    totalSalePrice: calculated.totalSalePrice,
    totalDiscount: calculated.totalDiscount,
    finalItemPrice: calculated.finalItemPrice,
    grossProfit: calculated.grossProfit,
    grossMarginPercent: calculated.grossMarginPercent,
    isVisibleToClient: parsed.isVisibleToClient,
    internalNotes: parsed.internalNotes || null,
    sortOrder: parsed.sortOrder,
  };
}

export async function createGeneralProposalItem(
  proposalId: string,
  _state: GeneralProposalItemActionState,
  formData: FormData
): Promise<GeneralProposalItemActionState> {
  await requireItemAccess();
  const parsed = parseItemForm(formData);

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const proposal = await tx.generalProposal.findFirst({
        where: { id: proposalId, deletedAt: null },
        select: {
          id: true,
          status: true,
          vendorId: true,
          licenseTermMonths: true,
        },
      });
      const proposalError = getProposalError(proposal);
      if (proposalError || !proposal) return actionError(proposalError!);

      const vendorId = parsed.data.vendorId || proposal.vendorId;
      const vendor = await tx.vendor.findUnique({
        where: { id: vendorId },
        select: { id: true },
      });
      if (!vendor) return actionError("Fabricante não encontrado.");

      await tx.generalProposalItem.create({
        data: {
          proposalId: proposal.id,
          ...itemData(parsed.data, proposal, vendor.id),
        },
      });
      await recalculateGeneralProposalTotals(tx, proposal.id);
      return {
        success: true,
        error: null,
        message: "Produto adicionado com sucesso.",
      };
    });

    if (!result.success) return result;
  } catch {
    return actionError("Não foi possível adicionar o produto.");
  }

  revalidatePath(`/dashboard/comercial/propostas-gerais/${proposalId}`);
  revalidatePath("/dashboard/comercial/propostas-gerais");
  return { success: true, error: null, message: "Produto adicionado com sucesso." };
}

export async function updateGeneralProposalItem(
  proposalId: string,
  itemId: string,
  _state: GeneralProposalItemActionState,
  formData: FormData
): Promise<GeneralProposalItemActionState> {
  await requireItemAccess();
  const parsed = parseItemForm(formData);

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const proposal = await tx.generalProposal.findFirst({
        where: { id: proposalId, deletedAt: null },
        select: {
          id: true,
          status: true,
          vendorId: true,
          licenseTermMonths: true,
        },
      });
      const proposalError = getProposalError(proposal);
      if (proposalError || !proposal) return actionError(proposalError!);

      const item = await tx.generalProposalItem.findFirst({
        where: { id: itemId, proposalId: proposal.id },
        select: { id: true },
      });
      if (!item) return actionError("Produto não encontrado nesta proposta.");

      const vendorId = parsed.data.vendorId || proposal.vendorId;
      const vendor = await tx.vendor.findUnique({
        where: { id: vendorId },
        select: { id: true },
      });
      if (!vendor) return actionError("Fabricante não encontrado.");

      await tx.generalProposalItem.update({
        where: { id: item.id },
        data: itemData(parsed.data, proposal, vendor.id),
      });
      await recalculateGeneralProposalTotals(tx, proposal.id);
      return {
        success: true,
        error: null,
        message: "Produto atualizado com sucesso.",
      };
    });

    if (!result.success) return result;
  } catch {
    return actionError("Não foi possível atualizar o produto.");
  }

  revalidatePath(`/dashboard/comercial/propostas-gerais/${proposalId}`);
  revalidatePath("/dashboard/comercial/propostas-gerais");
  return { success: true, error: null, message: "Produto atualizado com sucesso." };
}

export async function deleteGeneralProposalItem(
  proposalId: string,
  itemId: string,
  _state: GeneralProposalItemActionState,
  _formData: FormData
): Promise<GeneralProposalItemActionState> {
  await requireItemAccess();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const proposal = await tx.generalProposal.findFirst({
        where: { id: proposalId, deletedAt: null },
        select: { id: true, status: true },
      });
      const proposalError = getProposalError(proposal);
      if (proposalError || !proposal) return actionError(proposalError!);

      const item = await tx.generalProposalItem.findFirst({
        where: { id: itemId, proposalId: proposal.id },
        select: { id: true },
      });
      if (!item) return actionError("Produto não encontrado nesta proposta.");

      await tx.generalProposalItem.delete({ where: { id: item.id } });
      await recalculateGeneralProposalTotals(tx, proposal.id);
      return {
        success: true,
        error: null,
        message: "Produto removido com sucesso.",
      };
    });

    if (!result.success) return result;
  } catch {
    return actionError("Não foi possível remover o produto.");
  }

  revalidatePath(`/dashboard/comercial/propostas-gerais/${proposalId}`);
  revalidatePath("/dashboard/comercial/propostas-gerais");
  return { success: true, error: null, message: "Produto removido com sucesso." };
}
