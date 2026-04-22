import Link from "next/link";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import { notFound, redirect } from "next/navigation";

import { CopyPublicLinkButton } from "@/components/proposals/copy-public-link-button";
import { ProposalActions } from "@/components/proposals/proposal-actions";
import { ProposalPreview } from "@/components/proposals/proposal-preview";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatProposalNumber } from "@/lib/utils/proposals";

export default async function ProposalDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  const { id } = await params;

  const proposal = await prisma.proposal.findFirst({
    where: {
      id,
      ...(session.user.role === UserRole.ADMIN
        ? {}
        : { partnerId: session.user.id }),
    },
    include: {
      customer: true,
      partner: true,
    },
  });

  if (!proposal) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            Visualização da proposta
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Gerencie o status da proposta comercial.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <CopyPublicLinkButton
            code={formatProposalNumber(
              proposal.proposalNumber,
              proposal.createdAt
            )}
          />

          <Link
            href={`/dashboard/propostas/${proposal.id}/imprimir`}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Versão para impressão
          </Link>

          <Link
            href={`/api/propostas/${proposal.id}/pdf`}
            target="_blank"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Baixar PDF
          </Link>

          <ProposalActions
            proposalId={proposal.id}
            currentStatus={proposal.status}
          />
        </div>
      </div>

      <ProposalPreview proposal={proposal} />
    </div>
  );
}