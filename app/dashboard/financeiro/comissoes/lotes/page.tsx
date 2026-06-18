import { CommissionBatchStatus, Prisma } from "@prisma/client";
import Link from "next/link";

import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

type SearchParams = {
  partnerId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
};

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

export default async function CommissionBatchesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const selectedStatus = Object.values(CommissionBatchStatus).includes(
    params.status as CommissionBatchStatus
  )
    ? (params.status as CommissionBatchStatus)
    : null;
  const dateFrom = parseDate(params.dateFrom);
  const dateTo = parseEndDate(params.dateTo);
  const search = params.q?.trim();
  const searchFilters: Prisma.PartnerCommissionBatchWhereInput[] = search
    ? [
        {
          partner: {
            companyName: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
        { paymentReference: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ]
    : [];

  const partners = await prisma.partner.findMany({
    orderBy: { companyName: "asc" },
    select: { id: true, companyName: true, name: true },
  });

  const batches = await prisma.partnerCommissionBatch.findMany({
    where: {
      ...(params.partnerId ? { partnerId: params.partnerId } : {}),
      ...(selectedStatus ? { status: selectedStatus } : {}),
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
            Lotes de pagamento
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Fechamentos de comissões por parceiro e período.
          </p>
        </div>

        <Link
          href="/dashboard/financeiro/comissoes/lotes/novo"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Novo lote
        </Link>
      </div>

      <form className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
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
              {Object.values(CommissionBatchStatus).map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-slate-700">
              De
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
              placeholder="Parceiro ou referência"
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <Link
            href="/dashboard/financeiro/comissoes/lotes"
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
                "Período",
                "Status",
                "Comissões",
                "Total",
                "Criado em",
                "Pago em",
                "Referência",
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
            {batches.map((batch) => (
              <tr key={batch.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  {batch.partner.companyName || batch.partner.name}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {formatDate(batch.periodStart)} a {formatDate(batch.periodEnd)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[batch.status]}`}>
                    {statusLabels[batch.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {batch.commissionCount}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  {formatCurrency(batch.totalAmount)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {formatDate(batch.createdAt)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {formatDate(batch.paidAt)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {batch.paymentReference || "-"}
                </td>
                <td className="px-4 py-3 text-sm">
                  <Link
                    href={`/dashboard/financeiro/comissoes/lotes/${batch.id}`}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}

            {batches.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">
                  Nenhum lote encontrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
