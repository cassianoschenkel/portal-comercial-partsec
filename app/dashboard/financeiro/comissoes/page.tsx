import { CommissionStatus, Prisma } from "@prisma/client";
import Link from "next/link";

import { CommissionActionForm } from "@/components/commissions/commission-action-form";
import {
  cancelPartnerCommission,
  markCommissionPaid,
  releasePartnerCommission,
  syncPartnerCommissions,
  undoCommissionRelease,
  undoCommissionPayment,
} from "@/lib/actions/commissions";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import {
  formatProposalNumber,
  formatProposalPlan,
  formatProposalStatus,
  getProposalStatusBadgeClasses,
} from "@/lib/utils/proposals";

type SearchParams = {
  status?: string;
  partnerId?: string;
  dateField?: string;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
  operationalStatus?: string;
};

const statusLabels: Record<CommissionStatus, string> = {
  PENDING: "Pendente",
  PAID: "Paga",
  CANCELED: "Cancelada",
};

const statusBadgeClasses: Record<CommissionStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
  CANCELED: "bg-slate-100 text-slate-600",
};

const operationalLabels = {
  forecast: "Prevista",
  released: "Liberada",
  paid: "Paga",
  canceled: "Cancelada",
};

const operationalBadgeClasses = {
  forecast: "bg-blue-100 text-blue-700",
  released: "bg-emerald-100 text-emerald-700",
  paid: "bg-slate-900 text-white",
  canceled: "bg-slate-100 text-slate-600",
};

type OperationalStatusKey = keyof typeof operationalLabels;

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

function toDateInputValue(value: Date) {
  return value.toISOString().slice(0, 10);
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

function getDefaultDateFrom() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  date.setHours(0, 0, 0, 0);
  return date;
}

function sumBy<T>(items: T[], getValue: (item: T) => unknown) {
  return items.reduce((total, item) => total + Number(getValue(item) ?? 0), 0);
}

function buildExportHref(params: SearchParams) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }

  const queryString = query.toString();
  return `/api/financeiro/comissoes/exportar${queryString ? `?${queryString}` : ""}`;
}

export default async function PartnerCommissionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const exportHref = buildExportHref(params);
  const hasPeriodFilter = Boolean(params.dateFrom || params.dateTo);
  const dateFrom = parseDate(params.dateFrom) ?? getDefaultDateFrom();
  const dateTo = parseEndDate(params.dateTo) ?? new Date();
  const dateField = params.dateField === "paidAt" ? "paidAt" : "createdAt";
  const selectedStatus = Object.values(CommissionStatus).includes(
    params.status as CommissionStatus
  )
    ? (params.status as CommissionStatus)
    : null;
  const search = params.q?.trim();
  const operationalStatus = ["forecast", "released", "paid", "canceled"].includes(
    params.operationalStatus ?? ""
  )
    ? params.operationalStatus
    : "";
  const searchFilters: Prisma.PartnerCommissionWhereInput[] = search
    ? [
        {
          proposal: {
            title: { contains: search, mode: Prisma.QueryMode.insensitive },
          },
        },
        {
          proposal: {
            customer: {
              companyName: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
        },
        {
          partner: {
            companyName: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
        ...(Number.isNaN(Number(search))
          ? []
          : [{ proposal: { proposalNumber: Number(search) } }]),
      ]
    : [];

  const partners = await prisma.partner.findMany({
    orderBy: { companyName: "asc" },
    select: {
      id: true,
      companyName: true,
      name: true,
    },
  });

  const where: Prisma.PartnerCommissionWhereInput = {
    ...(selectedStatus ? { status: selectedStatus } : {}),
    ...(params.partnerId ? { partnerId: params.partnerId } : {}),
    ...(dateField === "paidAt"
      ? {
          paidAt: {
            gte: dateFrom,
            lte: dateTo,
          },
        }
      : {
          createdAt: {
            gte: dateFrom,
            lte: dateTo,
          },
        }),
    ...(searchFilters.length > 0 ? { OR: searchFilters } : {}),
    ...(operationalStatus === "forecast"
      ? { status: CommissionStatus.PENDING, releasedAt: null }
      : {}),
    ...(operationalStatus === "released"
      ? { status: CommissionStatus.PENDING, releasedAt: { not: null } }
      : {}),
    ...(operationalStatus === "paid"
      ? { status: CommissionStatus.PAID }
      : {}),
    ...(operationalStatus === "canceled"
      ? { status: CommissionStatus.CANCELED }
      : {}),
  };

  const commissions = await prisma.partnerCommission.findMany({
    where,
    include: {
      partner: {
        select: {
          companyName: true,
          name: true,
        },
      },
      paidBy: {
        select: {
          name: true,
          email: true,
        },
      },
      releasedBy: {
        select: {
          name: true,
          email: true,
        },
      },
      batch: {
        select: {
          id: true,
          status: true,
        },
      },
      statement: {
        select: {
          id: true,
          referenceMonth: true,
          status: true,
        },
      },
      proposal: {
        select: {
          id: true,
          proposalNumber: true,
          title: true,
          status: true,
          plan: true,
          createdAt: true,
          customer: {
            select: {
              companyName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingCommissions = commissions.filter(
    (commission) => commission.status === CommissionStatus.PENDING
  );
  const forecastCommissions = commissions.filter(
    (commission) =>
      commission.status === CommissionStatus.PENDING && !commission.releasedAt
  );
  const releasedCommissions = commissions.filter(
    (commission) =>
      commission.status === CommissionStatus.PENDING && commission.releasedAt
  );
  const paidCommissions = commissions.filter(
    (commission) => commission.status === CommissionStatus.PAID
  );
  const canceledCommissions = commissions.filter(
    (commission) => commission.status === CommissionStatus.CANCELED
  );
  const pendingTotal = sumBy(pendingCommissions, (commission) => commission.amount);
  const forecastTotal = sumBy(forecastCommissions, (commission) => commission.amount);
  const releasedTotal = sumBy(releasedCommissions, (commission) => commission.amount);
  const paidTotal = sumBy(paidCommissions, (commission) => commission.amount);
  const canceledTotal = sumBy(canceledCommissions, (commission) => commission.amount);
  const totalInFilter = sumBy(commissions, (commission) => commission.amount);
  const pendingByPartner = new Map<string, { name: string; total: number }>();

  for (const commission of pendingCommissions) {
    const partnerName = commission.partner.companyName || commission.partner.name;
    const current = pendingByPartner.get(commission.partnerId) ?? {
      name: partnerName,
      total: 0,
    };
    current.total += Number(commission.amount);
    pendingByPartner.set(commission.partnerId, current);
  }

  const topPendingPartner = Array.from(pendingByPartner.values()).sort(
    (left, right) => right.total - left.total
  )[0];

  const cards = [
    { label: "Previsto aguardando liberação", value: formatCurrency(forecastTotal) },
    { label: "Liberado pendente", value: formatCurrency(releasedTotal) },
    { label: "Pago no filtro", value: formatCurrency(paidTotal) },
    { label: "Cancelado", value: formatCurrency(canceledTotal) },
    { label: "Qtd. previstas", value: String(forecastCommissions.length) },
    { label: "Qtd. liberadas", value: String(releasedCommissions.length) },
    {
      label: "Maior pendência",
      value: topPendingPartner
        ? `${topPendingPartner.name} · ${formatCurrency(topPendingPartner.total)}`
        : "-",
    },
    { label: "Total no filtro", value: formatCurrency(totalInFilter) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Comissões</h1>
          <p className="mt-1 text-sm text-slate-600">
            Controle administrativo das comissões previstas, liberadas e pagas.
          </p>
          {!hasPeriodFilter ? (
            <p className="mt-2 text-sm text-slate-500">
              Período padrão: últimos 30 dias por data de criação da comissão.
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <Link
            href={exportHref}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Exportar CSV
          </Link>
          <Link
            href="/dashboard/financeiro/comissoes/lotes"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Lotes de pagamento
          </Link>
          <Link
            href="/dashboard/financeiro/comissoes/relatorios"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Relatórios mensais
          </Link>
          <CommissionActionForm
            action={syncPartnerCommissions}
            submitLabel="Sincronizar comissões"
            pendingLabel="Sincronizando..."
            variant="primary"
          />
        </div>
      </div>

      <form className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-7">
          <div>
            <label
              htmlFor="operationalStatus"
              className="block text-sm font-medium text-slate-700"
            >
              Operacional
            </label>
            <select
              id="operationalStatus"
              name="operationalStatus"
              defaultValue={operationalStatus}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="">Todas</option>
              <option value="forecast">Previstas</option>
              <option value="released">Liberadas</option>
              <option value="paid">Pagas</option>
              <option value="canceled">Canceladas</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-slate-700"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={params.status ?? ""}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="">Todos</option>
              {Object.values(CommissionStatus).map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="partnerId"
              className="block text-sm font-medium text-slate-700"
            >
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
            <label
              htmlFor="dateField"
              className="block text-sm font-medium text-slate-700"
            >
              Período por
            </label>
            <select
              id="dateField"
              name="dateField"
              defaultValue={dateField}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="createdAt">Criação</option>
              <option value="paidAt">Pagamento</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="dateFrom"
              className="block text-sm font-medium text-slate-700"
            >
              De
            </label>
            <input
              id="dateFrom"
              name="dateFrom"
              type="date"
              defaultValue={toDateInputValue(dateFrom)}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="dateTo"
              className="block text-sm font-medium text-slate-700"
            >
              Até
            </label>
            <input
              id="dateTo"
              name="dateTo"
              type="date"
              defaultValue={toDateInputValue(dateTo)}
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
              placeholder="Proposta, cliente ou parceiro"
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <Link
            href="/dashboard/financeiro/comissoes"
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Proposta",
                  "Cliente",
                  "Parceiro",
                  "Status proposta",
                  "Status comissão",
                  "Operacional",
                  "Lote",
                  "Relatório",
                  "Valor",
                  "Liberação",
                  "Recebimento cliente",
                  "Criada em",
                  "Vencimento",
                  "Pagamento",
                  "Pago por",
                  "Referência",
                  "Observações",
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
              {commissions.map((commission) => {
                const operationalStatusKey: OperationalStatusKey =
                  commission.status === CommissionStatus.CANCELED
                    ? "canceled"
                    : commission.status === CommissionStatus.PAID
                      ? "paid"
                      : commission.releasedAt
                        ? "released"
                        : "forecast";

                return (
                  <tr key={commission.id} className="hover:bg-slate-50">
                  <td className="min-w-56 px-4 py-3 text-sm">
                    <Link
                      href={`/dashboard/propostas/${commission.proposal.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {formatProposalNumber(
                        commission.proposal.proposalNumber,
                        commission.proposal.createdAt
                      )}
                    </Link>
                    <p className="mt-1 text-slate-500">
                      {commission.proposal.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatProposalPlan(commission.proposal.plan)}
                    </p>
                  </td>
                  <td className="min-w-44 px-4 py-3 text-sm text-slate-700">
                    {commission.proposal.customer.companyName}
                  </td>
                  <td className="min-w-44 px-4 py-3 text-sm text-slate-700">
                    {commission.partner.companyName || commission.partner.name}
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
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClasses[commission.status]}`}
                    >
                      {statusLabels[commission.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${operationalBadgeClasses[operationalStatusKey]}`}
                    >
                      {operationalStatusKey === "forecast"
                        ? "Aguardando recebimento"
                        : operationalLabels[operationalStatusKey]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {commission.batch ? (
                      <Link
                        href={`/dashboard/financeiro/comissoes/lotes/${commission.batch.id}`}
                        className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Em lote · {commission.batch.status}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {commission.statement ? (
                      <Link
                        href={`/dashboard/financeiro/comissoes/relatorios/${commission.statement.id}`}
                        className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        {commission.statement.referenceMonth} ·{" "}
                        {commission.statement.status}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                    {formatCurrency(commission.amount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {formatDate(commission.releasedAt)}
                  </td>
                  <td className="min-w-44 px-4 py-3 text-sm text-slate-700">
                    <div>{formatDate(commission.clientFirstPaymentConfirmedAt)}</div>
                    <div className="text-xs text-slate-500">
                      {commission.clientPaymentReference || "-"}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {formatDate(commission.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {formatDate(commission.dueDate)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {formatDate(commission.paidAt)}
                  </td>
                  <td className="min-w-36 px-4 py-3 text-sm text-slate-700">
                    {commission.paidBy
                      ? commission.paidBy.name || commission.paidBy.email
                      : "-"}
                  </td>
                  <td className="min-w-36 px-4 py-3 text-sm text-slate-700">
                    {commission.paymentReference || "-"}
                  </td>
                  <td className="min-w-48 px-4 py-3 text-sm text-slate-700">
                    {commission.notes || "-"}
                  </td>
                    <td className="min-w-72 px-4 py-3 text-sm">
                      {commission.batch ? (
                        <span className="text-sm text-slate-400">
                          Gerenciada pelo lote
                        </span>
                      ) : null}

                    {!commission.batch &&
                    commission.status === CommissionStatus.PENDING &&
                    !commission.releasedAt ? (
                      <div className="space-y-3">
                        <CommissionActionForm
                          action={releasePartnerCommission.bind(null, commission.id)}
                          submitLabel="Liberar comissão"
                          pendingLabel="Liberando..."
                          variant="primary"
                        >
                          <div className="grid gap-2">
                            <input
                              name="clientFirstPaymentConfirmedAt"
                              type="date"
                              defaultValue={toDateInputValue(new Date())}
                              className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                            />
                            <input
                              name="clientPaymentReference"
                              placeholder="Referência recebimento"
                              className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                            />
                            <input
                              name="releaseNotes"
                              placeholder="Observação"
                              className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                            />
                          </div>
                        </CommissionActionForm>

                        <CommissionActionForm
                          action={cancelPartnerCommission.bind(
                            null,
                            commission.id
                          )}
                          submitLabel="Cancelar"
                          pendingLabel="Cancelando..."
                          variant="danger"
                          confirmMessage="Cancelar esta comissão prevista?"
                        />
                      </div>
                    ) : null}

                    {!commission.batch &&
                    commission.status === CommissionStatus.PENDING ? (
                    commission.releasedAt ? (
                      <div className="space-y-3">
                        <CommissionActionForm
                          action={markCommissionPaid.bind(null, commission.id)}
                          submitLabel="Marcar paga"
                          pendingLabel="Salvando..."
                          variant="primary"
                        >
                          <div className="grid gap-2">
                            <input
                              name="paidAt"
                              type="date"
                              defaultValue={toDateInputValue(new Date())}
                              className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                            />
                            <input
                              name="paymentReference"
                              placeholder="Referência"
                              className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                            />
                            <input
                              name="notes"
                              placeholder="Observação"
                              className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                            />
                          </div>
                        </CommissionActionForm>

                        <CommissionActionForm
                          action={undoCommissionRelease.bind(null, commission.id)}
                          submitLabel="Reverter liberação"
                          pendingLabel="Revertendo..."
                          variant="secondary"
                          confirmMessage="Reverter a liberação desta comissão?"
                        />

                        <CommissionActionForm
                          action={cancelPartnerCommission.bind(
                            null,
                            commission.id
                          )}
                          submitLabel="Cancelar"
                          pendingLabel="Cancelando..."
                          variant="danger"
                          confirmMessage="Cancelar esta comissão pendente?"
                        />
                      </div>
                    ) : null
                    ) : null}

                    {!commission.batch &&
                    commission.status === CommissionStatus.PAID ? (
                      <CommissionActionForm
                        action={undoCommissionPayment.bind(null, commission.id)}
                        submitLabel="Desfazer pagamento"
                        pendingLabel="Desfazendo..."
                        variant="secondary"
                        confirmMessage="Voltar esta comissão para pendente?"
                      />
                    ) : null}

                    {!commission.batch &&
                    commission.status === CommissionStatus.CANCELED ? (
                      <span className="text-sm text-slate-400">
                        Sem ações disponíveis
                      </span>
                    ) : null}
                  </td>
                </tr>
                );
              })}

              {commissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={18}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    Nenhuma comissão encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
