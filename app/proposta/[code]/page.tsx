import { notFound } from "next/navigation";

import { ProposalPreview } from "@/components/proposals/proposal-preview";
import { prisma } from "@/lib/prisma";

function parseProposalCode(code: string) {
  const parts = code.split("-");
  const numericPart = parts[2];

  if (!numericPart) return null;

  const proposalNumber = Number(numericPart);
  return Number.isNaN(proposalNumber) ? null : proposalNumber;
}

export default async function PublicProposalPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const proposalNumber = parseProposalCode(code);

  if (!proposalNumber) {
    notFound();
  }

  const proposal = await prisma.proposal.findUnique({
    where: { proposalNumber },
    include: {
      customer: true,
      partner: true,
      items: true,
    },
  });

  if (!proposal) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto mb-6 max-w-5xl">
        <p className="text-sm text-slate-500">
          Visualização pública da proposta
        </p>
      </div>

      <ProposalPreview proposal={proposal} mode="public" />
    </main>
  );
}
