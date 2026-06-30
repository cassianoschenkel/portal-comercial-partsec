import Link from "next/link";
import { notFound } from "next/navigation";
import { GeneralProposalStatus } from "@prisma/client";

import { CloneGeneralProposalButton } from "@/components/general-proposals/clone-general-proposal-button";
import { GeneralProposalItemsSection } from "@/components/general-proposals/general-proposal-items-section";
import { GeneralProposalInternalSummary } from "@/components/general-proposals/general-proposal-internal-summary";
import { GeneralProposalServicesSection } from "@/components/general-proposals/general-proposal-services-section";
import { GeneralProposalStatusCard } from "@/components/general-proposals/general-proposal-status-card";

import {
  generalProposalStatusLabels,
  generalProposalTypeLabels,
  getGeneralProposalStatusClasses,
} from "@/lib/general-proposals/presentation";
import { buildGeneralProposalInternalSummary } from "@/lib/general-proposals/summary";
import {
  getRequiredSession,
  requireCanAccessGeneralProposals,
} from "@/lib/authz";
import { prisma } from "@/lib/prisma";

function formatCurrency(value: unknown, currency: string) {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(Number(value));
  } catch {
    return `${currency} ${Number(value).toFixed(2)}`;
  }
}

function formatDate(value: Date | null) {
  return value ? new Intl.DateTimeFormat("pt-BR").format(value) : "Não informada";
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

const finalStatuses = new Set<GeneralProposalStatus>([
  GeneralProposalStatus.WON,
  GeneralProposalStatus.LOST,
  GeneralProposalStatus.CANCELLED,
  GeneralProposalStatus.EXPIRED,
]);

function TextSection({ title, value }: { title: string; value: string | null }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{value || "Não informado."}</p>
    </div>
  );
}

export default async function GeneralProposalDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getRequiredSession();
  requireCanAccessGeneralProposals(session);
  const { id } = await params;
  const proposal = await prisma.generalProposal.findFirst({
    where: { id, deletedAt: null },
    include: {
      customer: true,
      vendor: true,
      createdBy: { select: { name: true } },
      items: {
        include: { vendor: { select: { name: true } } },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
      services: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
      statusHistory: {
        include: { changedBy: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!proposal) notFound();

  const vendors = await prisma.vendor.findMany({
    select: { id: true, name: true, isActive: true },
    orderBy: { name: "asc" },
  });
  const editableStatuses: GeneralProposalStatus[] = [
    GeneralProposalStatus.DRAFT,
    GeneralProposalStatus.INTERNAL_REVIEW,
  ];
  const editable = editableStatuses.includes(proposal.status);
  const internalSummary = buildGeneralProposalInternalSummary(proposal);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{proposal.proposalNumber}</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">{proposal.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getGeneralProposalStatusClasses(proposal.status)}`}>
              {generalProposalStatusLabels[proposal.status]}
            </span>
            <span className="text-sm text-slate-600">{generalProposalTypeLabels[proposal.proposalType]}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-right">
            <p className="text-xs font-semibold uppercase text-emerald-700">Valor final</p>
            <p className="mt-1 text-xl font-semibold text-emerald-900">{formatCurrency(proposal.finalPrice, proposal.currency)}</p>
          </div>
          <Link
            href={`/api/comercial/propostas-gerais/${proposal.id}/pdf`}
            target="_blank"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Gerar PDF
          </Link>
          <Link
            href={`/dashboard/comercial/propostas-gerais/${proposal.id}/editar`}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Editar dados da proposta
          </Link>
          <CloneGeneralProposalButton proposalId={proposal.id} />
          <Link href="/dashboard/comercial/propostas-gerais" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Voltar à listagem
          </Link>
        </div>
      </div>

      {finalStatuses.has(proposal.status) ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
          Esta proposta está em status final: <strong>{generalProposalStatusLabels[proposal.status]}</strong>.
        </div>
      ) : null}

      <GeneralProposalStatusCard
        proposalId={proposal.id}
        currentStatus={proposal.status}
      />

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Histórico de status</h2>
        {proposal.statusHistory.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Nenhuma alteração de status registrada.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {['Data/hora', 'De', 'Para', 'Alterado por', 'Observação'].map((label) => (
                    <th key={label} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proposal.statusHistory.map((entry) => (
                  <tr key={entry.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{formatDateTime(entry.createdAt)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{entry.fromStatus ? generalProposalStatusLabels[entry.fromStatus] : "Inicial"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getGeneralProposalStatusClasses(entry.toStatus)}`}>
                        {generalProposalStatusLabels[entry.toStatus]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{entry.changedBy.name}</td>
                    <td className="min-w-64 whitespace-pre-wrap px-4 py-3 text-sm text-slate-700">{entry.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-3">
        <div><p className="text-xs font-semibold uppercase text-slate-500">Cliente</p><p className="mt-1 font-medium text-slate-900">{proposal.customer.companyName}</p></div>
        <div><p className="text-xs font-semibold uppercase text-slate-500">Fabricante</p><p className="mt-1 font-medium text-slate-900">{proposal.vendor.name}</p></div>
        <div><p className="text-xs font-semibold uppercase text-slate-500">Criado por</p><p className="mt-1 font-medium text-slate-900">{proposal.createdBy.name}</p></div>
        <div><p className="text-xs font-semibold uppercase text-slate-500">Data de criação</p><p className="mt-1 text-slate-900">{formatDate(proposal.createdAt)}</p></div>
        <div><p className="text-xs font-semibold uppercase text-slate-500">Licenciamento</p><p className="mt-1 text-slate-900">{proposal.licenseTermMonths ? `${proposal.licenseTermMonths} meses` : "Não informado"}</p></div>
        <div><p className="text-xs font-semibold uppercase text-slate-500">Validade</p><p className="mt-1 text-slate-900">{formatDate(proposal.validUntil)}</p></div>
        <div><p className="text-xs font-semibold uppercase text-slate-500">Moeda</p><p className="mt-1 text-slate-900">{proposal.currency}</p></div>
      </section>

      <GeneralProposalInternalSummary
        currency={proposal.currency}
        financial={{
          subtotalProducts: proposal.subtotalProducts,
          subtotalServices: proposal.subtotalServices,
          totalCost: proposal.totalCost,
          totalSalePrice: proposal.totalSalePrice,
          totalDiscount: proposal.totalDiscount,
          finalPrice: proposal.finalPrice,
          grossProfit: proposal.grossProfit,
          grossMarginPercent: proposal.grossMarginPercent,
          markupPercent: proposal.markupPercent,
        }}
        summary={internalSummary}
      />

      <GeneralProposalItemsSection
        proposalId={proposal.id}
        primaryVendorId={proposal.vendorId}
        defaultLicenseTermMonths={proposal.licenseTermMonths}
        currency={proposal.currency}
        editable={editable}
        vendors={vendors}
        analysis={{
          count: internalSummary.products.count,
          totalCost: internalSummary.products.totalCost.toString(),
          totalSale: internalSummary.products.totalSale.toString(),
          grossProfit: internalSummary.products.grossProfit.toString(),
          grossMarginPercent: internalSummary.products.grossMarginPercent.toString(),
          lowestMarginName: internalSummary.products.lowestMarginName,
          lowestMarginPercent: internalSummary.products.lowestMarginPercent?.toString() ?? null,
          negativeCount: internalSummary.products.negativeCount,
        }}
        items={proposal.items.map((item) => ({
          id: item.id,
          vendorId: item.vendorId,
          sku: item.sku,
          productName: item.productName,
          description: item.description,
          category: item.category,
          quantity: item.quantity.toString(),
          licenseTermMonths: item.licenseTermMonths,
          costUnitPrice: item.costUnitPrice.toString(),
          listUnitPrice: item.listUnitPrice.toString(),
          pricingMode: item.pricingMode,
          marginPercent: item.marginPercent.toString(),
          markupPercent: item.markupPercent.toString(),
          pricingMarkupPercent: item.costUnitPrice.gt(0)
            ? item.saleUnitPrice
                .div(item.costUnitPrice)
                .minus(1)
                .mul(100)
                .toDecimalPlaces(4)
                .toString()
            : "0",
          discountPercent: item.discountPercent.toString(),
          saleUnitPrice: item.saleUnitPrice.toString(),
          totalCost: item.totalCost.toString(),
          finalItemPrice: item.finalItemPrice.toString(),
          grossProfit: item.grossProfit.toString(),
          grossMarginPercent: item.grossMarginPercent.toString(),
          isVisibleToClient: item.isVisibleToClient,
          internalNotes: item.internalNotes,
          sortOrder: item.sortOrder,
          vendor: item.vendor,
        }))}
      />

      <GeneralProposalServicesSection
        proposalId={proposal.id}
        currency={proposal.currency}
        editable={editable}
        analysis={{
          count: internalSummary.services.count,
          totalCost: internalSummary.services.totalCost.toString(),
          totalSale: internalSummary.services.totalSale.toString(),
          grossProfit: internalSummary.services.grossProfit.toString(),
          grossMarginPercent: internalSummary.services.grossMarginPercent.toString(),
          lowestMarginName: internalSummary.services.lowestMarginName,
          lowestMarginPercent: internalSummary.services.lowestMarginPercent?.toString() ?? null,
          belowCostCount: internalSummary.services.belowCostCount,
        }}
        services={proposal.services.map((service) => ({
          id: service.id,
          serviceName: service.serviceName,
          description: service.description,
          serviceType: service.serviceType,
          pricingMode: service.pricingMode,
          estimatedHours: service.estimatedHours.toString(),
          internalHourlyCost: service.internalHourlyCost.toString(),
          saleHourlyRate: service.saleHourlyRate.toString(),
          fixedCost: service.fixedCost.toString(),
          fixedSalePrice: service.fixedSalePrice.toString(),
          totalCost: service.totalCost.toString(),
          totalSalePrice: service.totalSalePrice.toString(),
          grossProfit: service.grossProfit.toString(),
          grossMarginPercent: service.grossMarginPercent.toString(),
          isVisibleToClient: service.isVisibleToClient,
          internalNotes: service.internalNotes,
          sortOrder: service.sortOrder,
        }))}
      />

      <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <TextSection title="Condições comerciais" value={proposal.paymentTerms} />
        <TextSection title="Resumo executivo" value={proposal.executiveSummary} />
        <TextSection title="Escopo do projeto" value={proposal.projectScope} />
        <TextSection title="Observações comerciais" value={proposal.commercialNotes} />
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-sm font-semibold text-amber-900">Observações internas</h2>
        <p className="mt-1 text-xs text-amber-700">Informação interna. Não aparece no PDF do cliente.</p>
        <p className="mt-3 whitespace-pre-wrap text-sm text-amber-950">{proposal.internalNotes || "Nenhuma observação interna."}</p>
      </section>
    </div>
  );
}
