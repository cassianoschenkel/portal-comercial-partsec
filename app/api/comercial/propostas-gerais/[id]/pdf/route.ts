import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import { NextResponse } from "next/server";

import { GeneralProposalPDF } from "@/components/general-proposals/general-proposal-pdf";
import {
  canAccessGeneralProposals,
  getRequiredSession,
} from "@/lib/authz";
import { getGeneralProposalPdfData } from "@/lib/general-proposals/pdf-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getRequiredSession();

  if (!canAccessGeneralProposals(session)) {
    return new NextResponse("Acesso negado.", { status: 403 });
  }

  const { id } = await params;

  try {
    const data = await getGeneralProposalPdfData(id);

    if (!data) {
      return new NextResponse("Proposta geral não encontrada.", {
        status: 404,
      });
    }

    const stream = await renderToStream(
      React.createElement(GeneralProposalPDF, { data }) as any
    );
    const fileName = `Proposta-Geral-Partsec-${data.proposalNumber}.pdf`;

    return new NextResponse(stream as any, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      },
    });
  } catch (error) {
    console.error("Falha ao gerar PDF de proposta geral.", error);
    return new NextResponse("Não foi possível gerar o PDF.", { status: 500 });
  }
}
