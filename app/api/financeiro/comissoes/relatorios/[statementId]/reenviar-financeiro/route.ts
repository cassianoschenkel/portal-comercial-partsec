import { PartnerCommissionStatementStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/authz";
import { sendFinanceDocumentsEmail } from "@/lib/commission-statement-notifications";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ statementId: string }> }
) {
  await requireAdmin();

  const { statementId } = await params;
  const statement = await prisma.partnerCommissionStatement.findUnique({
    where: { id: statementId },
    include: {
      documents: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!statement) {
    return NextResponse.json(
      { success: false, error: "Relatório não encontrado." },
      { status: 404 }
    );
  }

  if (statement.status === PartnerCommissionStatementStatus.CANCELED) {
    return NextResponse.json(
      {
        success: false,
        error: "Relatório cancelado não permite reenvio ao financeiro.",
      },
      { status: 400 }
    );
  }

  if (statement.documents.length < 2 || !statement.documentsReceivedAt) {
    return NextResponse.json(
      {
        success: false,
        error: "Relatório ainda não possui nota fiscal e boleto recebidos.",
      },
      { status: 400 }
    );
  }

  const emailResult = await sendFinanceDocumentsEmail(statement.id);

  if (!emailResult.sent) {
    return NextResponse.json(
      {
        success: false,
        error:
          emailResult.error ||
          "Falha ao enviar e-mail ao financeiro. Tente novamente.",
      },
      { status: 500 }
    );
  }

  await prisma.partnerCommissionStatement.update({
    where: { id: statement.id },
    data: {
      financeEmailSentAt: new Date(),
      financeEmailSentTo: emailResult.to,
    },
  });

  return NextResponse.json({
    success: true,
    message: "E-mail reenviado ao financeiro.",
  });
}
