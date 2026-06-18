"use server";

import { CommissionBatchStatus, CommissionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { type CommissionActionState } from "@/lib/actions/commissions";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

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

function parseDate(value: FormDataEntryValue | null, endOfDay = false) {
  if (typeof value !== "string" || !value) {
    return null;
  }

  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00"}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parsePaidAt(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value) {
    return new Date();
  }

  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function referenceMonthFromDate(date: Date) {
  return date.toISOString().slice(0, 7);
}

export async function createCommissionBatch(
  _state: CommissionActionState,
  formData: FormData
): Promise<CommissionActionState> {
  const session = await requireAdmin();

  const partnerId = String(formData.get("partnerId") || "").trim();
  const periodStart = parseDate(formData.get("periodStart"));
  const periodEnd = parseDate(formData.get("periodEnd"), true);
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!partnerId) {
    return actionError("Selecione um parceiro.");
  }

  if (!periodStart || !periodEnd) {
    return actionError("Informe o período do lote.");
  }

  if (periodStart > periodEnd) {
    return actionError("A data inicial não pode ser maior que a final.");
  }

  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    select: { id: true },
  });

  if (!partner) {
    return actionError("Parceiro não encontrado.");
  }

  const result = await prisma.$transaction(async (tx) => {
    const commissions = await tx.partnerCommission.findMany({
      where: {
        partnerId,
        status: CommissionStatus.PENDING,
        batchId: null,
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      select: {
        id: true,
        amount: true,
      },
    });

    if (commissions.length === 0) {
      return null;
    }

    const totalAmount = commissions.reduce(
      (total, commission) => total + Number(commission.amount),
      0
    );

    const batch = await tx.partnerCommissionBatch.create({
      data: {
        partnerId,
        periodStart,
        periodEnd,
        referenceMonth: referenceMonthFromDate(periodStart),
        totalAmount: totalAmount.toFixed(2),
        commissionCount: commissions.length,
        status: CommissionBatchStatus.DRAFT,
        notes,
        createdById: session.user.id,
      },
      select: { id: true },
    });

    await tx.partnerCommission.updateMany({
      where: {
        id: { in: commissions.map((commission) => commission.id) },
        batchId: null,
      },
      data: { batchId: batch.id },
    });

    return batch;
  });

  if (!result) {
    return actionError("Nenhuma comissão pendente elegível encontrada no período.");
  }

  revalidatePath("/dashboard/financeiro/comissoes");
  revalidatePath("/dashboard/financeiro/comissoes/lotes");
  redirect(`/dashboard/financeiro/comissoes/lotes/${result.id}`);
}

export async function payCommissionBatch(
  batchId: string,
  _state: CommissionActionState,
  formData: FormData
): Promise<CommissionActionState> {
  const session = await requireAdmin();
  const paidAt = parsePaidAt(formData.get("paidAt"));
  const paymentReference =
    String(formData.get("paymentReference") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;

  const result = await prisma.$transaction(async (tx) => {
    const batch = await tx.partnerCommissionBatch.findUnique({
      where: { id: batchId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!batch) {
      return "NOT_FOUND" as const;
    }

    if (batch.status === CommissionBatchStatus.CANCELED) {
      return "CANCELED" as const;
    }

    if (batch.status === CommissionBatchStatus.PAID) {
      return "PAID" as const;
    }

    await tx.partnerCommissionBatch.update({
      where: { id: batch.id },
      data: {
        status: CommissionBatchStatus.PAID,
        paidAt,
        paidById: session.user.id,
        paymentReference,
        notes: notes ?? undefined,
      },
    });

    await tx.partnerCommission.updateMany({
      where: { batchId: batch.id },
      data: {
        status: CommissionStatus.PAID,
        paidAt,
        paidById: session.user.id,
        paymentReference,
        ...(notes ? { notes } : {}),
      },
    });

    return "OK" as const;
  });

  if (result === "NOT_FOUND") return actionError("Lote não encontrado.");
  if (result === "CANCELED") return actionError("Lote cancelado não pode ser pago.");
  if (result === "PAID") return actionError("Este lote já está pago.");

  revalidatePath("/dashboard/financeiro/comissoes");
  revalidatePath("/dashboard/financeiro/comissoes/lotes");
  revalidatePath(`/dashboard/financeiro/comissoes/lotes/${batchId}`);
  return actionSuccess("Lote marcado como pago.");
}

export async function cancelCommissionBatch(
  batchId: string,
  _state: CommissionActionState,
  _formData: FormData
): Promise<CommissionActionState> {
  const session = await requireAdmin();

  const result = await prisma.$transaction(async (tx) => {
    const batch = await tx.partnerCommissionBatch.findUnique({
      where: { id: batchId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!batch) {
      return "NOT_FOUND" as const;
    }

    if (batch.status === CommissionBatchStatus.PAID) {
      return "PAID" as const;
    }

    if (batch.status === CommissionBatchStatus.CANCELED) {
      return "CANCELED" as const;
    }

    await tx.partnerCommissionBatch.update({
      where: { id: batch.id },
      data: {
        status: CommissionBatchStatus.CANCELED,
        canceledAt: new Date(),
        canceledById: session.user.id,
      },
    });

    await tx.partnerCommission.updateMany({
      where: { batchId: batch.id },
      data: {
        batchId: null,
        status: CommissionStatus.PENDING,
      },
    });

    return "OK" as const;
  });

  if (result === "NOT_FOUND") return actionError("Lote não encontrado.");
  if (result === "PAID") return actionError("Lote pago não pode ser cancelado.");
  if (result === "CANCELED") return actionError("Este lote já está cancelado.");

  revalidatePath("/dashboard/financeiro/comissoes");
  revalidatePath("/dashboard/financeiro/comissoes/lotes");
  revalidatePath(`/dashboard/financeiro/comissoes/lotes/${batchId}`);
  return actionSuccess("Lote cancelado. Comissões voltaram para pendente.");
}
