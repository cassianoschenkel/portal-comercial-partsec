"use server";

import { CommissionStatus, ProposalStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export type CommissionActionState = {
  success: boolean;
  error: string | null;
  message?: string | null;
};

function actionError(error: string): CommissionActionState {
  return {
    success: false,
    error,
  };
}

function actionSuccess(message: string): CommissionActionState {
  return {
    success: true,
    error: null,
    message,
  };
}

function parsePaidAt(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value) {
    return new Date();
  }

  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export async function syncPartnerCommissions(
  _state: CommissionActionState,
  _formData: FormData
): Promise<CommissionActionState> {
  await requireAdmin();

  const proposals = await prisma.proposal.findMany({
    where: {
      status: ProposalStatus.ACCEPTED,
      partnerCommission: { gt: 0 },
      commission: null,
    },
    select: {
      id: true,
      partnerId: true,
      partnerCommission: true,
    },
  });

  if (proposals.length === 0) {
    return actionSuccess("Nenhuma nova comissão elegível encontrada.");
  }

  const result = await prisma.partnerCommission.createMany({
    data: proposals.map((proposal) => ({
      proposalId: proposal.id,
      partnerId: proposal.partnerId,
      amount: proposal.partnerCommission,
      status: CommissionStatus.PENDING,
    })),
    skipDuplicates: true,
  });

  revalidatePath("/dashboard/financeiro/comissoes");
  return actionSuccess(
    `${result.count} comissão${result.count === 1 ? "" : "ões"} criada${result.count === 1 ? "" : "s"}.`
  );
}

export async function markCommissionPaid(
  commissionId: string,
  _state: CommissionActionState,
  formData: FormData
): Promise<CommissionActionState> {
  const session = await requireAdmin();

  const commission = await prisma.partnerCommission.findUnique({
    where: { id: commissionId },
    select: {
      id: true,
      status: true,
      batchId: true,
    },
  });

  if (!commission) {
    return actionError("Comissão não encontrada.");
  }

  if (commission.status === CommissionStatus.CANCELED) {
    return actionError("Comissão cancelada não pode ser marcada como paga.");
  }

  if (commission.status === CommissionStatus.PAID) {
    return actionError("Esta comissão já está paga.");
  }

  if (commission.batchId) {
    return actionError("Esta comissão está vinculada a um lote. Use o lote para pagamento.");
  }

  await prisma.partnerCommission.update({
    where: { id: commission.id },
    data: {
      status: CommissionStatus.PAID,
      paidAt: parsePaidAt(formData.get("paidAt")),
      paidById: session.user.id,
      paymentReference:
        String(formData.get("paymentReference") || "").trim() || null,
      notes: String(formData.get("notes") || "").trim() || null,
    },
  });

  revalidatePath("/dashboard/financeiro/comissoes");
  return actionSuccess("Comissão marcada como paga.");
}

export async function undoCommissionPayment(
  commissionId: string,
  _state: CommissionActionState,
  _formData: FormData
): Promise<CommissionActionState> {
  await requireAdmin();

  const commission = await prisma.partnerCommission.findUnique({
    where: { id: commissionId },
    select: {
      id: true,
      status: true,
      batchId: true,
    },
  });

  if (!commission) {
    return actionError("Comissão não encontrada.");
  }

  if (commission.status !== CommissionStatus.PAID) {
    return actionError("Apenas comissões pagas podem voltar para pendente.");
  }

  if (commission.batchId) {
    return actionError("Esta comissão está vinculada a um lote. Use o lote para desfazer o pagamento.");
  }

  await prisma.partnerCommission.update({
    where: { id: commission.id },
    data: {
      status: CommissionStatus.PENDING,
      paidAt: null,
      paidById: null,
      paymentReference: null,
    },
  });

  revalidatePath("/dashboard/financeiro/comissoes");
  return actionSuccess("Pagamento desfeito. Comissão voltou para pendente.");
}

export async function cancelPartnerCommission(
  commissionId: string,
  _state: CommissionActionState,
  _formData: FormData
): Promise<CommissionActionState> {
  const session = await requireAdmin();

  const commission = await prisma.partnerCommission.findUnique({
    where: { id: commissionId },
    select: {
      id: true,
      status: true,
      batchId: true,
    },
  });

  if (!commission) {
    return actionError("Comissão não encontrada.");
  }

  if (commission.status === CommissionStatus.PAID) {
    return actionError("Comissão paga não pode ser cancelada.");
  }

  if (commission.status === CommissionStatus.CANCELED) {
    return actionError("Esta comissão já está cancelada.");
  }

  if (commission.batchId) {
    return actionError("Esta comissão está vinculada a um lote. Cancele o lote antes de cancelar a comissão.");
  }

  await prisma.partnerCommission.update({
    where: { id: commission.id },
    data: {
      status: CommissionStatus.CANCELED,
      canceledAt: new Date(),
      canceledById: session.user.id,
    },
  });

  revalidatePath("/dashboard/financeiro/comissoes");
  return actionSuccess("Comissão cancelada.");
}
