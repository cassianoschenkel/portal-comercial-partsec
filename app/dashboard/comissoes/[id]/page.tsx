import {
  CommissionStatementDocumentType,
  PartnerCommissionStatementStatus,
} from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CommissionActionForm } from "@/components/commissions/commission-action-form";
import { uploadCommissionStatementDocuments } from "@/lib/actions/commission-statements";
import {
  getEffectivePartnerId,
  getRequiredSession,
  isPartnerAdmin,
} from "@/lib/authz";
import {
  documentDownloadPath,
  documentTypeLabel,
} from "@/lib/commission-documents";
import { prisma } from "@/lib/prisma";
import { formatProposalNumber } from "@/lib/utils/proposals";

const statusLabels: Record<PartnerCommissionStatementStatus, string> = {
  DRAFT: "Rascunho",
  SENT: "Enviado",
  WAITING_DOCUMENTS: "Aguardando documentos",
  DOCUMENTS_RECEIVED: "Documentos recebidos",
  CANCELED: "Cancelado",
};

const statusClasses: Record<PartnerCommissionStatementStatus, string> = {
  DRAFT: "bg-amber-100 text-amber-700",
  SENT: "bg-blue-100 text-blue-700",
  WAITING_DOCUMENTS: "bg-emerald-100 text-emerald-700",
  DOCUMENTS_RECEIVED: "bg-indigo-100 text-indigo-700",
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
          PartnerCommissionStatementStatus.DOCUMENTS_RECEIVED,
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
      documents: {
        include: {
          uploadedBy: { select: { name: true, email: true } },
        },
        orderBy: { type: "asc" },
      },
    },
  });

  if (!statement) {
    notFound();
  }

  const invoice = statement.documents.find(
    (document) => document.type === CommissionStatementDocumentType.INVOICE
  );
  const bankSlip = statement.documents.find(
    (document) => document.type === CommissionStatementDocumentType.BANK_SLIP
  );
  const canUploadDocuments =
    statement.status === PartnerCommissionStatementStatus.SENT ||
    statement.status === PartnerCommissionStatementStatus.WAITING_DOCUMENTS ||
    statement.status === PartnerCommissionStatementStatus.DOCUMENTS_RECEIVED;

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
            <strong>{formatCurrency(statement.totalAmount)}</strong> e, na
            descrição da nota fiscal, informe:{" "}
            <strong>Comissionamento por representação comercial</strong>.
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

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {[invoice, bankSlip].map((document, index) => {
            const type =
              index === 0
                ? CommissionStatementDocumentType.INVOICE
                : CommissionStatementDocumentType.BANK_SLIP;

            return (
              <div key={type} className="rounded-md border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  {documentTypeLabel(type)}
                </p>
                {document ? (
                  <div className="mt-2 space-y-1 text-sm text-slate-600">
                    <p>{document.originalFileName}</p>
                    <p>Enviado em {formatDate(document.uploadedAt)}</p>
                    <p>
                      Por {document.uploadedBy.name || document.uploadedBy.email}
                    </p>
                    <Link
                      href={documentDownloadPath(document.id)}
                      className="inline-flex rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Baixar
                    </Link>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">Pendente</p>
                )}
              </div>
            );
          })}
        </div>

        {canUploadDocuments ? (
          <div className="mt-5 rounded-md border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-950">
              Enviar ou substituir documentos
            </h3>
            <CommissionActionForm
              action={uploadCommissionStatementDocuments.bind(null, statement.id)}
              submitLabel="Enviar documentos"
              pendingLabel="Enviando..."
              variant="primary"
            >
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="invoice" className="block text-sm font-medium text-slate-700">
                    Nota fiscal PDF
                  </label>
                  <input
                    id="invoice"
                    name="invoice"
                    type="file"
                    accept="application/pdf,.pdf"
                    required
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="bankSlip" className="block text-sm font-medium text-slate-700">
                    Boleto PDF
                  </label>
                  <input
                    id="bankSlip"
                    name="bankSlip"
                    type="file"
                    accept="application/pdf,.pdf"
                    required
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="documentsNotes" className="block text-sm font-medium text-slate-700">
                    Observação
                  </label>
                  <textarea
                    id="documentsNotes"
                    name="documentsNotes"
                    rows={3}
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </CommissionActionForm>
          </div>
        ) : null}
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
