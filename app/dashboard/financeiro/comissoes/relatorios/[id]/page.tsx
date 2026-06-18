import { PartnerCommissionStatementStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CommissionActionForm } from "@/components/commissions/commission-action-form";
import {
  cancelCommissionStatement,
  sendCommissionStatement,
} from "@/lib/actions/commission-statements";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import {
  formatProposalNumber,
  formatProposalStatus,
  getProposalStatusBadgeClasses,
} from "@/lib/utils/proposals";

const statusLabels: Record<PartnerCommissionStatementStatus, string> = {
  DRAFT: "Rascunho",
  SENT: "Enviado",
  WAITING_DOCUMENTS: "Aguardando documentos",
  CANCELED: "Cancelado",
};

const statusClasses: Record<PartnerCommissionStatementStatus, string> = {
  DRAFT: "bg-amber-100 text-amber-700",
  SENT: "bg-blue-100 text-blue-700",
  WAITING_DOCUMENTS: "bg-emerald-100 text-emerald-700",
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

export default async function CommissionStatementDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const statement = await prisma.partnerCommissionStatement.findUnique({
    where: { id },
    include: {
      partner: { select: { companyName: true, name: true } },
      createdBy: { select: { name: true, email: true } },
      sentBy: { select: { name: true, email: true } },
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
        orderBy: { releasedAt: "asc" },
      },
    },
  });

  if (!statement) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            Relatório de comissões
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {statement.partner.companyName || statement.partner.name} ·{" "}
            {statement.referenceMonth}
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <Link
            href="/dashboard/financeiro/comissoes/relatorios"
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
            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[statement.status]}`}
          >
            {statusLabels[statement.status]}
          </span>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Total</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {formatCurrency(statement.totalAmount)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Comissões</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {statement.commissionCount}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Envio</p>
          <p className="mt-2 text-sm text-slate-900">
            {formatDate(statement.sentAt)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {statement.sentBy ? statement.sentBy.name || statement.sentBy.email : "Não enviado"}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <dl className="grid gap-4 md:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-slate-500">Período</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {formatDate(statement.periodStart)} a {formatDate(statement.periodEnd)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Criado por</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {statement.createdBy.name || statement.createdBy.email}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Cancelado por</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {statement.canceledBy
                ? statement.canceledBy.name || statement.canceledBy.email
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Criado em</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {formatDate(statement.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Cancelado em</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {formatDate(statement.canceledAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Observações</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {statement.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>

      {statement.status === PartnerCommissionStatementStatus.DRAFT ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Enviar ao parceiro
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              O relatório será enviado aos usuários ativos com role PARTNER ou
              PARTNER_ADMIN do parceiro.
            </p>
            <div className="mt-4">
              <CommissionActionForm
                action={sendCommissionStatement.bind(null, statement.id)}
                submitLabel="Enviar relatório"
                pendingLabel="Enviando..."
                variant="primary"
                confirmMessage="Enviar este relatório ao parceiro?"
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Cancelar relatório
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              As comissões serão desvinculadas e continuarão liberadas para novo
              relatório.
            </p>
            <div className="mt-4">
              <CommissionActionForm
                action={cancelCommissionStatement.bind(null, statement.id)}
                submitLabel="Cancelar relatório"
                pendingLabel="Cancelando..."
                variant="danger"
                confirmMessage="Cancelar este relatório? As comissões voltarão a ficar disponíveis."
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
                "Liberação",
                "Referência cliente",
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
            {statement.commissions.map((commission) => (
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
                  {formatDate(commission.releasedAt)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {commission.clientPaymentReference || "-"}
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

            {statement.commissions.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                  Nenhuma comissão vinculada ao relatório.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
