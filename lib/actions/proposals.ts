"use server";

import { ModuleType, ProposalStatus, UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateProposalPricing } from "@/lib/pricing";
import { proposalSchema } from "@/lib/validations/proposal";

function parseModulesFromFormData(formData: FormData) {
  const modulesJson = formData.get("modulesJson");

  if (typeof modulesJson === "string" && modulesJson.trim()) {
    try {
      const parsed = JSON.parse(modulesJson);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      throw new Error("Os módulos informados são inválidos.");
    }
  }

  const indexedModules = new Map<
    number,
    { moduleType?: FormDataEntryValue; quantity?: FormDataEntryValue }
  >();

  for (const [key, value] of formData.entries()) {
    const match = key.match(/^modules\[(\d+)\]\.(moduleType|quantity)$/);

    if (!match) {
      continue;
    }

    const index = Number(match[1]);
    const field = match[2] as "moduleType" | "quantity";
    const current = indexedModules.get(index) ?? {};
    current[field] = value;
    indexedModules.set(index, current);
  }

  return Array.from(indexedModules.entries())
    .sort(([left], [right]) => left - right)
    .map(([, module]) => ({
      moduleType: module.moduleType,
      quantity: module.quantity,
    }));
}

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
    modules: parseModulesFromFormData(formData),
    discountPercent: formData.get("discountPercent"),
    discountAmount: formData.get("discountAmount"),
    validityDays: formData.get("validityDays"),
    notes: formData.get("notes"),
    internalNotes: formData.get("internalNotes"),
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

  const modules =
    parsed.data.modules && parsed.data.modules.length > 0
      ? parsed.data.modules
      : [
          {
            moduleType: ModuleType.INFRASTRUCTURE,
            quantity: parsed.data.activeCount ?? 0,
          },
        ];

  const totals = await calculateProposalPricing({
    plan: parsed.data.plan,
    modules,
    discountPercent: parsed.data.discountPercent,
    discountAmount: parsed.data.discountAmount,
    partnerCommissionPct: Number(partner.commissionPercent),
    role: session.user.role,
  });

  const legacyActiveCount = modules.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const legacyUnitPrice =
    legacyActiveCount > 0
      ? Number((totals.monthlySubtotal / legacyActiveCount).toFixed(2))
      : 0;

  const proposal = await prisma.proposal.create({
    data: {
      customerId: parsed.data.customerId,
      partnerId: session.user.id,
      title: parsed.data.title,
      status: ProposalStatus.DRAFT,
      plan: parsed.data.plan,
      activeCount: legacyActiveCount,
      unitPrice: legacyUnitPrice.toString(),
      subtotal: totals.monthlySubtotal.toString(),
      discountPercent: totals.discountPercent.toString(),
      discountValue: totals.discountAmount.toString(),
      total: totals.finalMonthlyPrice.toString(),
      setupFee: totals.setupSubtotal.toString(),
      partnerCommissionPercent: totals.partnerCommissionPct.toString(),
      partnerCommissionValue: totals.partnerCommission.toString(),
      monthlySubtotal: totals.monthlySubtotal.toString(),
      setupSubtotal: totals.setupSubtotal.toString(),
      discountAmount: totals.discountAmount.toString(),
      finalMonthlyPrice: totals.finalMonthlyPrice.toString(),
      finalSetupPrice: totals.finalSetupPrice.toString(),
      firstMonthTotal: totals.firstMonthTotal.toString(),
      partnerCommissionPct: totals.partnerCommissionPct.toString(),
      partnerCommission: totals.partnerCommission.toString(),
      partsecNetRevenue: totals.partsecNetRevenue.toString(),
      validityDays: parsed.data.validityDays,
      notes: parsed.data.notes || null,
      internalNotes: parsed.data.internalNotes || null,
      scopeDescription: parsed.data.scopeDescription || null,
      items: {
        create: totals.items.map((item) => ({
          moduleType: item.moduleType,
          unitType: item.unitType,
          description: item.description,
          quantity: item.quantity,
          rangeLabel: item.rangeLabel,
          monthlyPrice: item.monthlyPrice.toString(),
          setupPrice: item.setupPrice.toString(),
        })),
      },
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
