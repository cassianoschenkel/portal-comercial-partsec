import { requireAdmin } from "@/lib/authz";
import { buildCsv, csvResponse, formatCsvDate, formatCsvDecimal } from "@/lib/financeiro/csv";
import { buildCommissionBatchWhere } from "@/lib/financeiro/filters";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  await requireAdmin();

  const url = new URL(request.url);
  const batches = await prisma.partnerCommissionBatch.findMany({
    where: buildCommissionBatchWhere(url.searchParams),
    include: {
      partner: { select: { companyName: true, name: true } },
      createdBy: { select: { name: true, email: true } },
      paidBy: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = [
    [
      "ID lote",
      "Parceiro",
      "Período inicial",
      "Período final",
      "Mês referência",
      "Status",
      "Quantidade comissões",
      "Total",
      "Criado em",
      "Criado por",
      "Pago em",
      "Pago por",
      "Referência pagamento",
      "Observações",
    ],
    ...batches.map((batch) => [
      batch.id,
      batch.partner.companyName || batch.partner.name,
      formatCsvDate(batch.periodStart),
      formatCsvDate(batch.periodEnd),
      batch.referenceMonth || "",
      batch.status,
      batch.commissionCount,
      formatCsvDecimal(batch.totalAmount),
      formatCsvDate(batch.createdAt),
      batch.createdBy.name || batch.createdBy.email,
      formatCsvDate(batch.paidAt),
      batch.paidBy ? batch.paidBy.name || batch.paidBy.email : "",
      batch.paymentReference || "",
      batch.notes || "",
    ]),
  ];

  return csvResponse(buildCsv(rows), "lotes-comissoes-partsec.csv");
}
