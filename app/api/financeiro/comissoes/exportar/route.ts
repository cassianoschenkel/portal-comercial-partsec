import { requireAdmin } from "@/lib/authz";
import { buildCsv, csvResponse, formatCsvDate, formatCsvDecimal } from "@/lib/financeiro/csv";
import { buildCommissionWhere } from "@/lib/financeiro/filters";
import { prisma } from "@/lib/prisma";
import {
  formatProposalNumber,
  formatProposalStatus,
} from "@/lib/utils/proposals";

export async function GET(request: Request) {
  await requireAdmin();

  const url = new URL(request.url);
  const commissions = await prisma.partnerCommission.findMany({
    where: buildCommissionWhere(url.searchParams),
    include: {
      partner: { select: { companyName: true, name: true } },
      batch: { select: { id: true, referenceMonth: true, status: true } },
      proposal: {
        select: {
          proposalNumber: true,
          title: true,
          status: true,
          createdAt: true,
          customer: { select: { companyName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = [
    [
      "ID comissão",
      "Número proposta",
      "Título proposta",
      "Cliente",
      "Parceiro",
      "Status proposta",
      "Status comissão",
      "Valor comissão",
      "Status operacional",
      "Data liberação",
      "Referência recebimento cliente",
      "Data criação",
      "Data pagamento",
      "Referência pagamento",
      "Lote",
      "Observações",
    ],
    ...commissions.map((commission) => [
      commission.id,
      formatProposalNumber(
        commission.proposal.proposalNumber,
        commission.proposal.createdAt
      ),
      commission.proposal.title,
      commission.proposal.customer.companyName,
      commission.partner.companyName || commission.partner.name,
      formatProposalStatus(commission.proposal.status),
      commission.status,
      formatCsvDecimal(commission.amount),
      commission.status === "CANCELED"
        ? "Cancelada"
        : commission.status === "PAID"
          ? "Paga"
          : commission.releasedAt
            ? "Liberada"
            : "Prevista",
      formatCsvDate(commission.releasedAt),
      commission.clientPaymentReference || "",
      formatCsvDate(commission.createdAt),
      formatCsvDate(commission.paidAt),
      commission.paymentReference || "",
      commission.batch
        ? `${commission.batch.referenceMonth || commission.batch.id} (${commission.batch.status})`
        : "",
      commission.notes || "",
    ]),
  ];

  return csvResponse(buildCsv(rows), "comissoes-partsec.csv");
}
