import { notFound } from "next/navigation";

import { PrintProposalButton } from "@/components/proposals/print-proposal-button";
import { ProposalPreview } from "@/components/proposals/proposal-preview";
import { prisma } from "@/lib/prisma";

export default async function PrintProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      customer: true,
      partner: true,
    },
  });

  if (!proposal) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto mb-6 flex max-w-5xl items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            Versão para impressão
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Use esta visualização para imprimir ou gerar PDF no navegador.
          </p>
        </div>

        <PrintProposalButton />
      </div>

      <ProposalPreview proposal={proposal} />
    </div>
  );
}
