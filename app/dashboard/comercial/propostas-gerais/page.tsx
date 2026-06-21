import Link from "next/link";
import {
  GeneralProposalStatus,
  GeneralProposalType,
  Prisma,
} from "@prisma/client";

import { GeneralProposalsTable } from "@/components/general-proposals/general-proposals-table";
import {
  generalProposalStatusLabels,
  generalProposalTypeLabels,
} from "@/lib/general-proposals/presentation";
import {
  getRequiredSession,
  requireCanAccessGeneralProposals,
} from "@/lib/authz";
import { prisma } from "@/lib/prisma";

type SearchParams = {
  status?: string;
  vendorId?: string;
  customerId?: string;
  proposalType?: string;
};

export default async function GeneralProposalsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getRequiredSession();
  requireCanAccessGeneralProposals(session);
  const params = await searchParams;
  const selectedStatus = Object.values(GeneralProposalStatus).includes(
    params.status as GeneralProposalStatus
  )
    ? (params.status as GeneralProposalStatus)
    : null;
  const selectedType = Object.values(GeneralProposalType).includes(
    params.proposalType as GeneralProposalType
  )
    ? (params.proposalType as GeneralProposalType)
    : null;

  const where: Prisma.GeneralProposalWhereInput = {
    deletedAt: null,
    ...(selectedStatus ? { status: selectedStatus } : {}),
    ...(selectedType ? { proposalType: selectedType } : {}),
    ...(params.vendorId ? { vendorId: params.vendorId } : {}),
    ...(params.customerId ? { customerId: params.customerId } : {}),
  };

  const [proposals, vendors, customers] = await Promise.all([
    prisma.generalProposal.findMany({
      where,
      include: {
        customer: { select: { companyName: true } },
        vendor: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.vendor.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.customer.findMany({
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            Propostas Gerais
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Consulte e crie propostas comerciais internas da Partsec.
          </p>
        </div>
        <Link
          href="/dashboard/comercial/propostas-gerais/nova"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Nova proposta geral
        </Link>
      </div>

      <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-5">
        <select name="status" defaultValue={selectedStatus ?? ""} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Todos os status</option>
          {Object.values(GeneralProposalStatus).map((status) => (
            <option key={status} value={status}>{generalProposalStatusLabels[status]}</option>
          ))}
        </select>
        <select name="vendorId" defaultValue={params.vendorId ?? ""} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Todos os fabricantes</option>
          {vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}
        </select>
        <select name="customerId" defaultValue={params.customerId ?? ""} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Todos os clientes</option>
          {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.companyName}</option>)}
        </select>
        <select name="proposalType" defaultValue={selectedType ?? ""} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Todos os tipos</option>
          {Object.values(GeneralProposalType).map((type) => (
            <option key={type} value={type}>{generalProposalTypeLabels[type]}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Filtrar
          </button>
          <Link href="/dashboard/comercial/propostas-gerais" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Limpar
          </Link>
        </div>
      </form>

      <GeneralProposalsTable proposals={proposals} />
    </div>
  );
}
