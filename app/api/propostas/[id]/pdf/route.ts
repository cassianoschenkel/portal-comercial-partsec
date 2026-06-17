import React from "react";
import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";

import { ProposalPDF } from "@/components/proposals/proposal-pdf";
import {
  getEffectivePartnerId,
  getRequiredSession,
  isAdmin,
} from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { formatProposalNumber } from "@/lib/utils/proposals";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getRequiredSession();
  const partnerId = getEffectivePartnerId(session);
  const { id } = await params;

  const proposal = await prisma.proposal.findFirst({
    where: {
      id,
      ...(isAdmin(session) ? {} : { partnerId: partnerId ?? "" }),
    },
    include: {
      customer: true,
      partner: true,
      items: true,
    },
  });

  if (!proposal) {
    return new NextResponse("Not found", { status: 404 });
  }

  const stream = await renderToStream(
    React.createElement(ProposalPDF, { proposal }) as any
  );

  const formattedNumber = formatProposalNumber(
    proposal.proposalNumber,
    proposal.createdAt
  );

  const fileName = `Proposta-Partsec-${formattedNumber}.pdf`;

  return new NextResponse(stream as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    },
  });
}
