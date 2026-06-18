import { CommissionBatchStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PrintButton } from "@/components/financeiro/print-button";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import {
  formatProposalNumber,
  formatProposalStatus,
} from "@/lib/utils/proposals";

const statusLabels: Record<CommissionBatchStatus, string> = {
  DRAFT: "Rascunho",
  PAID: "Pago",
  CANCELED: "Cancelado",
};

function formatCurrency(value: unknown) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value ?? 0));
}

function formatDate(value: Date | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR").format(value);
}

export default async function PrintCommissionBatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const batch = await prisma.partnerCommissionBatch.findUnique({
    where: { id },
    include: {
      partner: { select: { companyName: true, name: true } },
      createdBy: { select: { name: true, email: true } },
      paidBy: { select: { name: true, email: true } },
      commissions: {
        include: {
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
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!batch) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white px-8 py-8 text-slate-950 print:p-0">
      <style>
        {`
          @media print {
            body { background: white; }
            .print-hidden { display: none !important; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
          }
        `}
      </style>

      <div className="print-hidden mb-6 flex justify-between gap-3">
        <Link
          href={`/dashboard/financeiro/comissoes/lotes/${batch.id}`}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Voltar
        </Link>
        <PrintButton />
      </div>

      <section className="mx-auto max-w-5xl">
        <header className="border-b border-slate-300 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">
            Partsec
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            Resumo de Lote de Comissões
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Emitido em {formatDate(new Date())}
          </p>
        </header>

        <dl className="mt-8 grid gap-4 md:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">
              Parceiro
            </dt>
            <dd className="mt-1 text-sm">
              {batch.partner.companyName || batch.partner.name}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">
              Período
            </dt>
            <dd className="mt-1 text-sm">
              {formatDate(batch.periodStart)} a {formatDate(batch.periodEnd)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">
              Status
            </dt>
            <dd className="mt-1 text-sm">{statusLabels[batch.status]}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">
              Total
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {formatCurrency(batch.totalAmount)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">
              Quantidade
            </dt>
            <dd className="mt-1 text-sm">{batch.commissionCount}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">
              Criado em
            </dt>
            <dd className="mt-1 text-sm">{formatDate(batch.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">
              Criado por
            </dt>
            <dd className="mt-1 text-sm">
              {batch.createdBy.name || batch.createdBy.email}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">
              Pago em
            </dt>
            <dd className="mt-1 text-sm">{formatDate(batch.paidAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">
              Pago por
            </dt>
            <dd className="mt-1 text-sm">
              {batch.paidBy ? batch.paidBy.name || batch.paidBy.email : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-500">
              Referência
            </dt>
            <dd className="mt-1 text-sm">{batch.paymentReference || "-"}</dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-xs font-semibold uppercase text-slate-500">
              Observações
            </dt>
            <dd className="mt-1 text-sm">{batch.notes || "-"}</dd>
          </div>
        </dl>

        <table className="mt-8 w-full border-collapse text-sm">
          <thead>
            <tr className="border-y border-slate-300 bg-slate-50">
              <th className="px-3 py-2 text-left font-semibold">Proposta</th>
              <th className="px-3 py-2 text-left font-semibold">Cliente</th>
              <th className="px-3 py-2 text-left font-semibold">
                Status proposta
              </th>
              <th className="px-3 py-2 text-right font-semibold">
                Comissão
              </th>
              <th className="px-3 py-2 text-left font-semibold">
                Status comissão
              </th>
            </tr>
          </thead>
          <tbody>
            {batch.commissions.map((commission) => (
              <tr key={commission.id} className="border-b border-slate-200">
                <td className="px-3 py-2">
                  <div className="font-medium">
                    {formatProposalNumber(
                      commission.proposal.proposalNumber,
                      commission.proposal.createdAt
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {commission.proposal.title}
                  </div>
                </td>
                <td className="px-3 py-2">
                  {commission.proposal.customer.companyName}
                </td>
                <td className="px-3 py-2">
                  {formatProposalStatus(commission.proposal.status)}
                </td>
                <td className="px-3 py-2 text-right">
                  {formatCurrency(commission.amount)}
                </td>
                <td className="px-3 py-2">{commission.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
