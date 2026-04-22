import Link from "next/link";

import {
  formatProposalNumber,
  formatProposalPlan,
  formatProposalStatus,
  getProposalStatusBadgeClasses,
} from "@/lib/utils/proposals";

type ProposalRow = {
  id: string;
  proposalNumber: number;
  title: string;
  plan: string;
  activeCount: number;
  total: unknown;
  partnerCommissionValue: unknown;
  status: string;
  createdAt: Date;
  customer: {
    companyName: string;
  };
};

function formatCurrency(value: unknown) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

export function ProposalsTable({ proposals }: { proposals: ProposalRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Nº
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Proposta
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Cliente
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Plano
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ativos
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Comissão
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ações
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {proposals.map((proposal) => (
            <tr key={proposal.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-sm text-slate-700">
                {formatProposalNumber(proposal.proposalNumber, proposal.createdAt)}
              </td>

              <td className="px-4 py-3 text-sm font-medium text-slate-900">
                {proposal.title}
              </td>

              <td className="px-4 py-3 text-sm text-slate-700">
                {proposal.customer.companyName}
              </td>

              <td className="px-4 py-3 text-sm text-slate-700">
                {formatProposalPlan(proposal.plan)}
              </td>

              <td className="px-4 py-3 text-sm text-slate-700">
                {proposal.activeCount}
              </td>

              <td className="px-4 py-3 text-sm text-slate-700">
                {formatCurrency(proposal.total)}
              </td>

              <td className="px-4 py-3 text-sm text-slate-700">
                {formatCurrency(proposal.partnerCommissionValue)}
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

              <td className="px-4 py-3 text-right">
                <Link
                  href={`/dashboard/propostas/${proposal.id}`}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}

          {proposals.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-500">
                Nenhuma proposta cadastrada.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
