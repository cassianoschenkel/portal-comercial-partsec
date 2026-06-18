import { PartnerCommissionStatementStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getEffectivePartnerId,
  getRequiredSession,
  isPartnerAdmin,
} from "@/lib/authz";
import { prisma } from "@/lib/prisma";

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

export default async function MyCommissionStatementsPage() {
  const session = await getRequiredSession();

  if (!isPartnerAdmin(session)) {
    notFound();
  }

  const partnerId = getEffectivePartnerId(session);
  if (!partnerId) {
    notFound();
  }

  const statements = await prisma.partnerCommissionStatement.findMany({
    where: {
      partnerId,
      status: {
        in: [
          PartnerCommissionStatementStatus.SENT,
          PartnerCommissionStatementStatus.WAITING_DOCUMENTS,
        ],
      },
    },
    orderBy: { sentAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">
          Minhas comissões
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Relatórios mensais de comissões liberadas para faturamento.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Mês",
                "Período",
                "Status",
                "Comissões",
                "Total",
                "Enviado em",
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
            {statements.map((statement) => (
              <tr key={statement.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  {statement.referenceMonth}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {formatDate(statement.periodStart)} a {formatDate(statement.periodEnd)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[statement.status]}`}>
                    {statusLabels[statement.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {statement.commissionCount}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  {formatCurrency(statement.totalAmount)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {formatDate(statement.sentAt)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <Link
                    href={`/dashboard/comissoes/${statement.id}`}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}

            {statements.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                  Nenhum relatório de comissões disponível.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
