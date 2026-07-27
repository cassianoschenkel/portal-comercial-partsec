import { notFound } from "next/navigation";

import {
  ProposalForm,
  type ProposalFormInitialValues,
} from "@/components/proposals/proposal-form";
import { updateProposal } from "@/lib/actions/proposals";
import {
  getEffectivePartnerId,
  getRequiredSession,
  isAdmin,
  requireCanUpdateProposal,
} from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export default async function EditProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getRequiredSession();
  requireCanUpdateProposal(session);

  const partnerId = getEffectivePartnerId(session);
  const { id } = await params;

  const proposal = await prisma.proposal.findFirst({
    where: {
      id,
      deletedAt: null,
      ...(isAdmin(session) ? {} : { partnerId: partnerId ?? "" }),
    },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!proposal || proposal.status !== "DRAFT") {
    notFound();
  }

  const customers = await prisma.customer.findMany({
    where: isAdmin(session) ? {} : { partnerId: partnerId ?? "" },
    select: {
      id: true,
      companyName: true,
      tradeName: true,
    },
    orderBy: {
      companyName: "asc",
    },
  });

  const initialValues: ProposalFormInitialValues = {
    customerId: proposal.customerId,
    title: proposal.title,
    plan: proposal.plan,
    discountPercent: proposal.discountPercent.toString(),
    validityDays: proposal.validityDays,
    scopeDescription: proposal.scopeDescription,
    notes: proposal.notes,
    internalNotes: proposal.internalNotes,
    modules: proposal.items.map((item) => ({
      moduleType: item.moduleType,
      quantity: item.quantity,
      pricingMode: item.pricingMode,
      manualMonthlyPrice: item.manualMonthlyPrice?.toString() ?? null,
      manualSetupPrice: item.manualSetupPrice?.toString() ?? null,
      pricingJustification: item.pricingJustification,
    })),
  };

  const action = updateProposal.bind(null, proposal.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">
          Editar proposta
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Ajuste os dados comerciais da proposta em rascunho antes do envio.
        </p>
      </div>

      <ProposalForm
        customers={customers}
        action={action}
        mode="edit"
        initialValues={initialValues}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}
