import Link from "next/link";
import type {
  GeneralProposalStatus,
  GeneralProposalType,
} from "@prisma/client";

import {
  generalProposalStatusLabels,
  generalProposalTypeLabels,
  getGeneralProposalStatusClasses,
} from "@/lib/general-proposals/presentation";

type GeneralProposalRow = {
  id: string;
  proposalNumber: string;
  title: string;
  proposalType: GeneralProposalType;
  status: GeneralProposalStatus;
  currency: string;
  finalPrice: unknown;
  grossMarginPercent: unknown;
  createdAt: Date;
  customer: { companyName: string };
  vendor: { name: string };
  createdBy: { name: string };
};

function formatCurrency(value: unknown, currency: string) {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
    }).format(Number(value));
  } catch {
    return `${currency} ${Number(value).toFixed(2)}`;
  }
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(value);
}

export function GeneralProposalsTable({
  proposals,
}: {
  proposals: GeneralProposalRow[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-[1200px] divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {[
              "Número", "Cliente", "Fabricante", "Título", "Tipo", "Status",
              "Valor final", "Margem bruta", "Criado por", "Criação",
            ].map((label) => (
              <th key={label} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </th>
            ))}
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {proposals.map((proposal) => (
            <tr key={proposal.id} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-900">{proposal.proposalNumber}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{proposal.customer.companyName}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{proposal.vendor.name}</td>
              <td className="px-4 py-3 text-sm text-slate-900">{proposal.title}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{generalProposalTypeLabels[proposal.proposalType]}</td>
              <td className="px-4 py-3 text-sm">
                <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${getGeneralProposalStatusClasses(proposal.status)}`}>
                  {generalProposalStatusLabels[proposal.status]}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{formatCurrency(proposal.finalPrice, proposal.currency)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{Number(proposal.grossMarginPercent).toLocaleString("pt-BR", { maximumFractionDigits: 4 })}%</td>
              <td className="px-4 py-3 text-sm text-slate-700">{proposal.createdBy.name}</td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{formatDate(proposal.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/dashboard/comercial/propostas-gerais/${proposal.id}`}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Visualizar
                </Link>
              </td>
            </tr>
          ))}
          {proposals.length === 0 ? (
            <tr>
              <td colSpan={11} className="px-4 py-8 text-center text-sm text-slate-500">
                Nenhuma proposta geral cadastrada.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
