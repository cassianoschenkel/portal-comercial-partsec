import Link from "next/link";

import { ProposalsTable } from "@/components/proposals/proposals-table";
import {
  canCreateProposal,
  getEffectivePartnerId,
  getRequiredSession,
  isAdmin,
} from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export default async function ProposalsPage() {
  const session = await getRequiredSession();
  const partnerId = getEffectivePartnerId(session);
  const canCreate = canCreateProposal(session);

  const proposals = await prisma.proposal.findMany({
    where: isAdmin(session) ? {} : { partnerId: partnerId ?? "" },
    include: {
      customer: {
        select: {
          companyName: true,
        },
      },
    },
    orderBy: {
      proposalNumber: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Propostas</h1>
          <p className="mt-1 text-sm text-slate-600">
            Gerencie as propostas comerciais geradas no portal.
          </p>
        </div>

        {canCreate ? (
          <Link
            href="/dashboard/propostas/nova"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Nova proposta
          </Link>
        ) : null}
      </div>

      <ProposalsTable proposals={proposals} />
    </div>
  );
}
