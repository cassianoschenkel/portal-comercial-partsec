import { PartnerCommissionStatementStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getEffectivePartnerId,
  getRequiredSession,
  isPartnerAdmin,
} from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { formatProposalNumber } from "@/lib/utils/proposals";

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

export default async function MyCommissionStatementDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getRequiredSession();

  if (!isPartnerAdmin(session)) {
    notFound();
  }

  const partnerId = getEffectivePartnerId(session);
  if (!partnerId) {
    notFound();
  }

  const { id } = await params;
  const statement = await prisma.partnerCommissionStatement.findFirst({
    where: {
      id,
      partnerId,
      status: {
        in: [
          PartnerCommissionStatementStatus.SENT,
          PartnerCommissionStatementStatus.WAITING_DOCUMENTS,
        ],
      },
    },
    include: {
      commissions: {
        include: {
          proposal: {
            select: {
              proposalNumber: true,
              title: true,
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
            {statement.referenceMonth} · {formatDate(statement.periodStart)} a{" "}
            {formatDate(statement.periodEnd)}
          </p>
        </div>

        <Link
          href="/dashboard/comissoes"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Voltar
        </Link>
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
          <p className="text-sm font-medium text-slate-500">Total para faturamento</p>
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
          <p className="text-sm font-medium text-slate-500">Enviado em</p>
          <p className="mt-2 text-sm text-slate-900">
            {formatDate(statement.sentAt)}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-950">
          Documentos para pagamento
        </h2>
        <div className="mt-3 grid gap-3 text-sm text-slate-700">
          <p>
            Emita a nota fiscal e o boleto no valor total de{" "}
            <strong>{formatCurrency(statement.totalAmount)}</strong>.
          </p>
          <p>
            O pagamento será processado após recebimento e conferência dos
            documentos pelo financeiro da Partsec.
          </p>
          <p>
            O envio de NF e boleto pelo portal será disponibilizado na próxima
            etapa. Em caso de orientação operacional, use como referência o
            e-mail financeiro@partsec.com.br.
          </p>
        </div>
        <button
          type="button"
          disabled
          className="mt-4 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400"
        >
          Enviar documentos em breve
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {["Proposta", "Cliente", "Liberação", "Valor"].map((header) => (
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
                <td className="px-4 py-3 text-sm text-slate-700">
                  {formatDate(commission.releasedAt)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  {formatCurrency(commission.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
