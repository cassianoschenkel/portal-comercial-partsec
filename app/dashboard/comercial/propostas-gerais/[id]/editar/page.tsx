import { notFound } from "next/navigation";

import { GeneralProposalEditForm } from "@/components/general-proposals/general-proposal-edit-form";
import { getRequiredSession, requireCanAccessGeneralProposals } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export default async function EditGeneralProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getRequiredSession();
  requireCanAccessGeneralProposals(session);
  const { id } = await params;

  const proposal = await prisma.generalProposal.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      title: true,
      proposalType: true,
      vendorId: true,
      licenseTermMonths: true,
      validUntil: true,
      paymentTerms: true,
      executiveSummary: true,
      projectScope: true,
      commercialNotes: true,
      internalNotes: true,
      currency: true,
      customer: { select: { companyName: true, tradeName: true } },
    },
  });

  if (!proposal) notFound();

  const vendors = await prisma.vendor.findMany({
    where: { OR: [{ isActive: true }, { id: proposal.vendorId }] },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Editar dados da proposta</h1>
        <p className="mt-1 text-sm text-slate-600">Atualize os dados gerais. Produtos, serviços, status e valores não serão alterados.</p>
      </div>
      <GeneralProposalEditForm
        proposal={{
          ...proposal,
          validUntil: proposal.validUntil?.toISOString().slice(0, 10) ?? "",
          customerName: proposal.customer.tradeName
            ? `${proposal.customer.companyName} (${proposal.customer.tradeName})`
            : proposal.customer.companyName,
        }}
        vendors={vendors}
      />
    </div>
  );
}
