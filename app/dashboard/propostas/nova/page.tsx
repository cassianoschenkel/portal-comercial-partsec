import { redirect } from "next/navigation";

import { ProposalForm } from "@/components/proposals/proposal-form";
import { createProposal } from "@/lib/actions/proposals";
import {
  getEffectivePartnerId,
  getRequiredSession,
  isAdmin,
} from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export default async function NewProposalPage() {
  const session = await getRequiredSession();
  const partnerId = getEffectivePartnerId(session);

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

  if (customers.length === 0) {
    redirect("/dashboard/clientes/novo");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Nova proposta</h1>
        <p className="mt-1 text-sm text-slate-600">
          Gere uma proposta comercial com cálculo automático.
        </p>
      </div>

      <ProposalForm customers={customers} action={createProposal} />
    </div>
  );
}
