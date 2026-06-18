import { CommissionBatchStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CommissionActionForm } from "@/components/commissions/commission-action-form";
import {
  cancelCommissionBatch,
  payCommissionBatch,
} from "@/lib/actions/commission-batches";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import {
  formatProposalNumber,
  formatProposalStatus,
  getProposalStatusBadgeClasses,
} from "@/lib/utils/proposals";

const statusLabels: Record<CommissionBatchStatus, string> = {
  DRAFT: "Rascunho",
  PAID: "Pago",
  CANCELED: "Cancelado",
};

const statusClasses: Record<CommissionBatchStatus, string> = {
  DRAFT: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
  CANCELED: "bg-slate-100 text-slate-600",
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

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default async function CommissionBatchDetailsPage({
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
      canceledBy: { select: { name: true, email: true } },
      commissions: {
        include: {
          proposal: {
            select: {
              id: true,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            Lote de comissões
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {batch.partner.companyName || batch.partner.name} ·{" "}
            {formatDate(batch.periodStart)} a {formatDate(batch.periodEnd)}
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <Link
            href={`/api/financeiro/comissoes/lotes/${batch.id}/exportar`}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Exportar itens CSV
          </Link>
          <Link
            href={`/dashboard/financeiro/comissoes/lotes/${batch.id}/imprimir`}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Imprimir resumo
          </Link>
          <Link
            href="/dashboard/financeiro/comissoes/lotes"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Voltar
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Status</p>
          <span
            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[batch.status]}`}
          >
            {statusLabels[batch.status]}
          </span>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Total</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {formatCurrency(batch.totalAmount)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Comissões</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {batch.commissionCount}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Pagamento</p>
          <p className="mt-2 text-sm text-slate-900">
            {formatDate(batch.paidAt)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {batch.paymentReference || "Sem referência"}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <dl className="grid gap-4 md:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-slate-500">Criado por</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {batch.createdBy.name || batch.createdBy.email}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Pago por</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {batch.paidBy ? batch.paidBy.name || batch.paidBy.email : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Cancelado por</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {batch.canceledBy
                ? batch.canceledBy.name || batch.canceledBy.email
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Criado em</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {formatDate(batch.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Cancelado em</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {formatDate(batch.canceledAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Observações</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {batch.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>

      {batch.status === CommissionBatchStatus.DRAFT ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Marcar lote como pago
            </h2>
            <CommissionActionForm
              action={payCommissionBatch.bind(null, batch.id)}
              submitLabel="Confirmar pagamento"
              pendingLabel="Salvando..."
              variant="primary"
            >
              <div className="mt-4 grid gap-3">
                <input
                  name="paidAt"
                  type="date"
                  defaultValue={today()}
                  className="rounded-md border border-slate-300 px-3 py-2"
                />
                <input
                  name="paymentReference"
                  placeholder="Referência de pagamento"
                  className="rounded-md border border-slate-300 px-3 py-2"
                />
                <input
                  name="notes"
                  placeholder="Observação"
                  className="rounded-md border border-slate-300 px-3 py-2"
                />
              </div>
            </CommissionActionForm>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Cancelar lote
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              As comissões serão desvinculadas e continuarão pendentes.
            </p>
            <div className="mt-4">
              <CommissionActionForm
                action={cancelCommissionBatch.bind(null, batch.id)}
                submitLabel="Cancelar lote"
                pendingLabel="Cancelando..."
                variant="danger"
                confirmMessage="Cancelar este lote? As comissões voltarão para pendente sem lote."
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Proposta",
                "Cliente",
                "Status proposta",
                "Status comissão",
                "Valor",
                "Ações",
              ].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {batch.commissions.map((commission) => (
              <tr key={commission.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm">
                  <p className="font-medium text-slate-900">
                    {formatProposalNumber(
                      commission.proposal.proposalNumber,
                      commission.proposal.createdAt
                    )}
                  </p>
                  <p className="text-slate-500">{commission.proposal.title}</p>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {commission.proposal.customer.companyName}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getProposalStatusBadgeClasses(
                      commission.proposal.status
                    )}`}
                  >
                    {formatProposalStatus(commission.proposal.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {commission.status}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  {formatCurrency(commission.amount)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <Link
                    href={`/dashboard/propostas/${commission.proposal.id}`}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Abrir proposta
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
