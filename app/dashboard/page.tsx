import Link from "next/link";

import {
  getEffectivePartnerId,
  getRequiredSession,
  isAdmin,
} from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { formatProposalNumber } from "@/lib/utils/proposals";

function formatCurrency(value: unknown) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

export default async function DashboardPage() {
  const session = await getRequiredSession();
  const partnerId = getEffectivePartnerId(session);

  const whereFilter = isAdmin(session) ? {} : { partnerId: partnerId ?? "" };
  const customerWhereFilter = { ...whereFilter };
  const proposalWhereFilter = { ...whereFilter, deletedAt: null };

  const [customersCount, proposalsCount, recentProposals] = await Promise.all([
    prisma.customer.count({
      where: customerWhereFilter,
    }),
    prisma.proposal.count({
      where: proposalWhereFilter,
    }),
    prisma.proposal.findMany({
      where: whereFilter,
      include: {
        customer: {
          select: {
            companyName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Visão geral do portal comercial.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Clientes</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {customersCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Propostas</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {proposalsCount}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Propostas recentes
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Últimas propostas registradas no portal.
            </p>
          </div>

          <Link
            href="/dashboard/propostas"
            className="text-sm font-medium text-slate-700 hover:text-slate-950"
          >
            Ver todas
          </Link>
        </div>

        <div className="mt-6 space-y-3">
          {recentProposals.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nenhuma proposta cadastrada.
            </p>
          ) : (
            recentProposals.map((proposal) => (
              <Link
                key={proposal.id}
                href={`/dashboard/propostas/${proposal.id}`}
                className="block rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-950">
                      {proposal.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {proposal.customer.companyName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatProposalNumber(
                        proposal.proposalNumber,
                        proposal.createdAt
                      )}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-950">
                      {formatCurrency(proposal.total)}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
