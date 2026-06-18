import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/authz";
import { buildCsv, csvResponse, formatCsvDate, formatCsvDecimal } from "@/lib/financeiro/csv";
import { prisma } from "@/lib/prisma";
import {
  formatProposalNumber,
  formatProposalStatus,
} from "@/lib/utils/proposals";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();

  const { id } = await params;
  const batch = await prisma.partnerCommissionBatch.findUnique({
    where: { id },
    include: {
      commissions: {
        include: {
          proposal: {
            select: {
              proposalNumber: true,
              title: true,
              status: true,
              createdAt: true,
              finalMonthlyPrice: true,
              total: true,
              customer: { select: { companyName: true } },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!batch) {
    notFound();
  }

  const rows = [
    [
      "Número proposta",
      "Título proposta",
      "Cliente",
      "Status proposta",
      "Valor mensal proposta",
      "Valor comissão",
      "Status comissão",
      "Data criação comissão",
      "Data pagamento",
      "Referência pagamento",
    ],
    ...batch.commissions.map((commission) => [
      formatProposalNumber(
        commission.proposal.proposalNumber,
        commission.proposal.createdAt
      ),
      commission.proposal.title,
      commission.proposal.customer.companyName,
      formatProposalStatus(commission.proposal.status),
      formatCsvDecimal(
        Number(commission.proposal.finalMonthlyPrice) > 0
          ? commission.proposal.finalMonthlyPrice
          : commission.proposal.total
      ),
      formatCsvDecimal(commission.amount),
      commission.status,
      formatCsvDate(commission.createdAt),
      formatCsvDate(commission.paidAt),
      commission.paymentReference || "",
    ]),
  ];

  return csvResponse(buildCsv(rows), `lote-comissoes-${batch.id}.csv`);
}
