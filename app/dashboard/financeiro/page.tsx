import { Prisma, ProposalPlan, ProposalStatus } from "@prisma/client";
import Link from "next/link";

import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import {
  formatProposalNumber,
  formatProposalPlan,
  formatProposalStatus,
  getProposalStatusBadgeClasses,
} from "@/lib/utils/proposals";

type SearchParams = {
  dateFrom?: string;
  dateTo?: string;
  partnerId?: string;
  status?: string;
  plan?: string;
  q?: string;
};

function formatCurrency(value: unknown) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value ?? 0));
}

function formatDate(value: Date) {
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

function firstPositiveValue(primary: unknown, fallback: unknown) {
  const primaryValue = Number(primary ?? 0);
  return primaryValue > 0 ? primaryValue : Number(fallback ?? 0);
}

export default async function FinancialDashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const hasPeriodFilter = Boolean(params.dateFrom || params.dateTo);
  const dateFrom = parseDate(params.dateFrom) ?? getDefaultDateFrom();
  const dateTo = parseEndDate(params.dateTo) ?? new Date();
  const search = params.q?.trim();
  const selectedStatus = Object.values(ProposalStatus).includes(
    params.status as ProposalStatus
  )
    ? (params.status as ProposalStatus)
    : null;
  const selectedPlan = Object.values(ProposalPlan).includes(
    params.plan as ProposalPlan
  )
    ? (params.plan as ProposalPlan)
    : null;
  const searchFilters: Prisma.ProposalWhereInput[] = search
    ? [
        { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
        {
          customer: {
            companyName: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
        ...(Number.isNaN(Number(search))
          ? []
          : [{ proposalNumber: Number(search) }]),
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

  const where: Prisma.ProposalWhereInput = {
    deletedAt: null,
    createdAt: {
      gte: dateFrom,
      lte: dateTo,
    },
    ...(params.partnerId ? { partnerId: params.partnerId } : {}),
    ...(selectedStatus ? { status: selectedStatus } : {}),
    ...(selectedPlan ? { plan: selectedPlan } : {}),
    ...(searchFilters.length > 0 ? { OR: searchFilters } : {}),
  };

  const proposals = await prisma.proposal.findMany({
    where,
    include: {
      customer: {
        select: {
          companyName: true,
        },
      },
      partner: {
        select: {
          companyName: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const statusCounts = Object.fromEntries(
    Object.values(ProposalStatus).map((status) => [status, 0])
  ) as Record<ProposalStatus, number>;

  for (const proposal of proposals) {
    statusCounts[proposal.status] += 1;
  }

  const monthlyRevenue = sumBy(
    proposals,
    (proposal) => firstPositiveValue(proposal.finalMonthlyPrice, proposal.total)
  );
  const setupRevenue = sumBy(
    proposals,
    (proposal) => firstPositiveValue(proposal.finalSetupPrice, proposal.setupFee)
  );
  const firstMonthTotal = sumBy(proposals, (proposal) =>
    firstPositiveValue(
      proposal.firstMonthTotal,
      firstPositiveValue(proposal.finalMonthlyPrice, proposal.total) +
        firstPositiveValue(proposal.finalSetupPrice, proposal.setupFee)
    )
  );
  const partnerCommission = sumBy(
    proposals,
    (proposal) =>
      firstPositiveValue(
        proposal.partnerCommission,
        proposal.partnerCommissionValue
      )
  );
  const partsecNetRevenue = sumBy(proposals, (proposal) =>
    firstPositiveValue(
      proposal.partsecNetRevenue,
      firstPositiveValue(proposal.finalMonthlyPrice, proposal.total) -
        firstPositiveValue(
          proposal.partnerCommission,
          proposal.partnerCommissionValue
        )
    )
  );
  const averageMonthlyTicket =
    proposals.length > 0 ? monthlyRevenue / proposals.length : 0;

  const cards = [
    { label: "Propostas", value: String(proposals.length) },
    { label: "Receita mensal", value: formatCurrency(monthlyRevenue) },
    { label: "Setup", value: formatCurrency(setupRevenue) },
    { label: "Total primeiro mês", value: formatCurrency(firstMonthTotal) },
    { label: "Comissão parceiros", value: formatCurrency(partnerCommission) },
    { label: "Receita líquida Partsec", value: formatCurrency(partsecNetRevenue) },
    { label: "Ticket médio mensal", value: formatCurrency(averageMonthlyTicket) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">
              Financeiro
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Visão administrativa dos valores calculados nas propostas.
            </p>
            {!hasPeriodFilter ? (
              <p className="mt-2 text-sm text-slate-500">
                Período padrão: últimos 30 dias.
              </p>
            ) : null}
          </div>

          <Link
            href="/dashboard/financeiro/comissoes"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Comissões
          </Link>
        </div>
      </div>

      <form className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
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
              {Object.values(ProposalStatus).map((status) => (
                <option key={status} value={status}>
                  {formatProposalStatus(status)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="plan"
              className="block text-sm font-medium text-slate-700"
            >
              Plano
            </label>
            <select
              id="plan"
              name="plan"
              defaultValue={params.plan ?? ""}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="">Todos</option>
              {Object.values(ProposalPlan).map((plan) => (
                <option key={plan} value={plan}>
                  {formatProposalPlan(plan)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="q" className="block text-sm font-medium text-slate-700">
              Busca
            </label>
            <input
              id="q"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Cliente, título ou nº"
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <Link
            href="/dashboard/financeiro"
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-950">
          Propostas por status
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {Object.values(ProposalStatus).map((status) => (
            <span
              key={status}
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getProposalStatusBadgeClasses(
                status
              )}`}
            >
              {formatProposalStatus(status)}: {statusCounts[status]}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Nº",
                  "Proposta",
                  "Cliente",
                  "Parceiro",
                  "Status",
                  "Plano",
                  "Mensal",
                  "Setup",
                  "1º mês",
                  "Comissão",
                  "Líquida Partsec",
                  "Criada em",
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
              {proposals.map((proposal) => {
                const finalMonthlyPrice =
                  firstPositiveValue(
                    proposal.finalMonthlyPrice,
                    proposal.total
                  );
                const finalSetupPrice =
                  firstPositiveValue(proposal.finalSetupPrice, proposal.setupFee);
                const rowFirstMonthTotal =
                  firstPositiveValue(
                    proposal.firstMonthTotal,
                    finalMonthlyPrice + finalSetupPrice
                  );
                const rowPartnerCommission =
                  firstPositiveValue(
                    proposal.partnerCommission,
                    proposal.partnerCommissionValue
                  );
                const rowNetRevenue =
                  firstPositiveValue(
                    proposal.partsecNetRevenue,
                    finalMonthlyPrice - rowPartnerCommission
                  );

                return (
                  <tr
                    key={proposal.id}
                    className={
                      proposal.status === ProposalStatus.ACCEPTED
                        ? "bg-emerald-50/40 hover:bg-emerald-50"
                        : "hover:bg-slate-50"
                    }
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                      {formatProposalNumber(
                        proposal.proposalNumber,
                        proposal.createdAt
                      )}
                    </td>
                    <td className="min-w-52 px-4 py-3 text-sm font-medium text-slate-900">
                      {proposal.title}
                    </td>
                    <td className="min-w-44 px-4 py-3 text-sm text-slate-700">
                      {proposal.customer.companyName}
                    </td>
                    <td className="min-w-44 px-4 py-3 text-sm text-slate-700">
                      {proposal.partner.companyName || proposal.partner.name}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getProposalStatusBadgeClasses(
                          proposal.status
                        )}`}
                      >
                        {formatProposalStatus(proposal.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {formatProposalPlan(proposal.plan)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                      {formatCurrency(finalMonthlyPrice)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                      {formatCurrency(finalSetupPrice)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                      {formatCurrency(rowFirstMonthTotal)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                      {formatCurrency(rowPartnerCommission)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                      {formatCurrency(rowNetRevenue)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                      {formatDate(proposal.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/dashboard/propostas/${proposal.id}`}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {proposals.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    Nenhuma proposta encontrada para os filtros selecionados.
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
