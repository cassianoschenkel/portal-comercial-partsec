import { PartnerCommissionStatementStatus, Prisma } from "@prisma/client";
import Link from "next/link";

import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

type SearchParams = {
  partnerId?: string;
  status?: string;
  referenceMonth?: string;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
};

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

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseEndDate(value?: string) {
  if (!value) return null;
  const date = new Date(`${value}T23:59:59.999`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default async function CommissionStatementsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const selectedStatus = Object.values(PartnerCommissionStatementStatus).includes(
    params.status as PartnerCommissionStatementStatus
  )
    ? (params.status as PartnerCommissionStatementStatus)
    : null;
  const dateFrom = parseDate(params.dateFrom);
  const dateTo = parseEndDate(params.dateTo);
  const search = params.q?.trim();
  const searchFilters: Prisma.PartnerCommissionStatementWhereInput[] = search
    ? [
        {
          partner: {
            companyName: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
        {
          partner: {
            name: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
      ]
    : [];

  const partners = await prisma.partner.findMany({
    orderBy: { companyName: "asc" },
    select: { id: true, companyName: true, name: true },
  });

  const statements = await prisma.partnerCommissionStatement.findMany({
    where: {
      ...(params.partnerId ? { partnerId: params.partnerId } : {}),
      ...(selectedStatus ? { status: selectedStatus } : {}),
      ...(params.referenceMonth ? { referenceMonth: params.referenceMonth } : {}),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: dateFrom } : {}),
              ...(dateTo ? { lte: dateTo } : {}),
            },
          }
        : {}),
      ...(searchFilters.length > 0 ? { OR: searchFilters } : {}),
    },
    include: {
      partner: { select: { companyName: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            Relatórios de comissões
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Relatórios mensais de comissões liberadas para faturamento do parceiro.
          </p>
        </div>

        <Link
          href="/dashboard/financeiro/comissoes/relatorios/novo"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Novo relatório
        </Link>
      </div>

      <form className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <div>
            <label htmlFor="partnerId" className="block text-sm font-medium text-slate-700">
              Parceiro
            </label>
            <select
              id="partnerId"
              name="partnerId"
              defaultValue={params.partnerId ?? ""}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="">Todos</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.companyName || partner.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={params.status ?? ""}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="">Todos</option>
              {Object.values(PartnerCommissionStatementStatus).map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="referenceMonth" className="block text-sm font-medium text-slate-700">
              Mês
            </label>
            <input
              id="referenceMonth"
              name="referenceMonth"
              type="month"
              defaultValue={params.referenceMonth ?? ""}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-slate-700">
              Criado de
            </label>
            <input
              id="dateFrom"
              name="dateFrom"
              type="date"
              defaultValue={params.dateFrom ?? ""}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="dateTo" className="block text-sm font-medium text-slate-700">
              Até
            </label>
            <input
              id="dateTo"
              name="dateTo"
              type="date"
              defaultValue={params.dateTo ?? ""}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="q" className="block text-sm font-medium text-slate-700">
              Busca
            </label>
            <input
              id="q"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Parceiro"
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <Link
            href="/dashboard/financeiro/comissoes/relatorios"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Limpar
          </Link>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Filtrar
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Parceiro",
                "Mês",
                "Período",
                "Status",
                "Comissões",
                "Total",
                "Documentos",
                "E-mail financeiro",
                "Criado em",
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
                  {statement.partner.companyName || statement.partner.name}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
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
                  {statement.documentsReceivedAt ? "Recebido" : "Pendente"}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {statement.financeEmailSentAt ? "Enviado" : "Pendente"}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {formatDate(statement.createdAt)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {formatDate(statement.sentAt)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <Link
                    href={`/dashboard/financeiro/comissoes/relatorios/${statement.id}`}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}

            {statements.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-10 text-center text-sm text-slate-500">
                  Nenhum relatório encontrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
