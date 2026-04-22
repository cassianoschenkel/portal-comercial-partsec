"use server";

import { ProposalStatus, UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateProposalTotals } from "@/lib/pricing";
import { proposalSchema } from "@/lib/validations/proposal";

export async function createProposal(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.role) {
    throw new Error("Usuário não autenticado.");
  }

  const parsed = proposalSchema.safeParse({
    customerId: formData.get("customerId"),
    title: formData.get("title"),
    plan: formData.get("plan"),
    activeCount: formData.get("activeCount"),
    discountPercent: formData.get("discountPercent"),
    notes: formData.get("notes"),
    scopeDescription: formData.get("scopeDescription"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Dados inválidos.");
  }

  const partner = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!partner) {
    throw new Error("Parceiro não encontrado.");
  }

  const customer = await prisma.customer.findFirst({
    where: {
      id: parsed.data.customerId,
      ...(session.user.role === UserRole.ADMIN
        ? {}
        : { partnerId: session.user.id }),
    },
  });

  if (!customer) {
    throw new Error("Cliente inválido para este usuário.");
  }

  const totals = calculateProposalTotals({
    plan: parsed.data.plan,
    activeCount: parsed.data.activeCount,
    discountPercent: parsed.data.discountPercent,
    commissionPercent: Number(partner.commissionPercent),
  });

  const proposal = await prisma.proposal.create({
    data: {
      customerId: parsed.data.customerId,
      partnerId: session.user.id,
      title: parsed.data.title,
      status: ProposalStatus.DRAFT,
      plan: parsed.data.plan,
      activeCount: parsed.data.activeCount,
      unitPrice: totals.unitPrice.toString(),
      subtotal: totals.subtotal.toString(),
      discountPercent: totals.discountPercent.toString(),
      discountValue: totals.discountValue.toString(),
      total: totals.total.toString(),
      setupFee: totals.setupFee.toString(),
      partnerCommissionPercent: totals.partnerCommissionPercent.toString(),
      partnerCommissionValue: totals.partnerCommissionValue.toString(),
      notes: parsed.data.notes || null,
      scopeDescription: parsed.data.scopeDescription || null,
    },
  });

  revalidatePath("/dashboard/propostas");
  redirect(`/dashboard/propostas/${proposal.id}`);
}

export async function acceptProposal(formData: FormData) {
  const proposalId = String(formData.get("proposalId") || "");
  const acceptedByName = String(formData.get("acceptedByName") || "").trim();
  const acceptedByEmail = String(formData.get("acceptedByEmail") || "").trim();

  if (!proposalId) {
    throw new Error("Proposta inválida.");
  }

  if (!acceptedByName) {
    throw new Error("Nome do responsável é obrigatório.");
  }

  if (!acceptedByEmail) {
    throw new Error("E-mail do responsável é obrigatório.");
  }

  await prisma.proposal.update({
    where: { id: proposalId },
    data: {
      status: ProposalStatus.ACCEPTED,
      acceptedByName,
      acceptedByEmail,
      acceptedAt: new Date(),
    },
  });

  revalidatePath("/proposta");
  revalidatePath("/dashboard/propostas");
}

export async function updateProposalStatus(
  id: string,
  status: ProposalStatus
) {
  await prisma.proposal.update({
    where: { id },
    data: { status },
  });

  revalidatePath(`/dashboard/propostas/${id}`);
  revalidatePath("/dashboard/propostas");
}