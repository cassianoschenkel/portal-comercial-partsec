import { CommissionBatchStatus, CommissionStatus, Prisma } from "@prisma/client";

export function parseDate(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseEndDate(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T23:59:59.999`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function defaultDateFrom() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function buildCommissionWhere(searchParams: URLSearchParams) {
  const status = searchParams.get("status");
  const partnerId = searchParams.get("partnerId");
  const dateField = searchParams.get("dateField") === "paidAt" ? "paidAt" : "createdAt";
  const dateFrom = parseDate(searchParams.get("dateFrom")) ?? defaultDateFrom();
  const dateTo = parseEndDate(searchParams.get("dateTo")) ?? new Date();
  const query = searchParams.get("q")?.trim();
  const batchId = searchParams.get("batchId")?.trim();
  const operationalStatus = searchParams.get("operationalStatus");
  const selectedStatus = Object.values(CommissionStatus).includes(
    status as CommissionStatus
  )
    ? (status as CommissionStatus)
    : null;
  const searchFilters: Prisma.PartnerCommissionWhereInput[] = query
    ? [
        {
          proposal: {
            title: { contains: query, mode: Prisma.QueryMode.insensitive },
          },
        },
        {
          proposal: {
            customer: {
              companyName: {
                contains: query,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
        },
        {
          partner: {
            companyName: {
              contains: query,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
        ...(Number.isNaN(Number(query))
          ? []
          : [{ proposal: { proposalNumber: Number(query) } }]),
      ]
    : [];

  return {
    ...(selectedStatus ? { status: selectedStatus } : {}),
    ...(partnerId ? { partnerId } : {}),
    ...(batchId ? { batchId } : {}),
    ...(dateField === "paidAt"
      ? { paidAt: { gte: dateFrom, lte: dateTo } }
      : { createdAt: { gte: dateFrom, lte: dateTo } }),
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
  } satisfies Prisma.PartnerCommissionWhereInput;
}

export function buildCommissionBatchWhere(searchParams: URLSearchParams) {
  const status = searchParams.get("status");
  const partnerId = searchParams.get("partnerId");
  const dateFrom = parseDate(searchParams.get("dateFrom"));
  const dateTo = parseEndDate(searchParams.get("dateTo"));
  const query = searchParams.get("q")?.trim();
  const selectedStatus = Object.values(CommissionBatchStatus).includes(
    status as CommissionBatchStatus
  )
    ? (status as CommissionBatchStatus)
    : null;
  const searchFilters: Prisma.PartnerCommissionBatchWhereInput[] = query
    ? [
        {
          partner: {
            companyName: {
              contains: query,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
        {
          paymentReference: {
            contains: query,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ]
    : [];

  return {
    ...(partnerId ? { partnerId } : {}),
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
  } satisfies Prisma.PartnerCommissionBatchWhereInput;
}
