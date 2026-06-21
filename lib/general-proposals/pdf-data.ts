import { GeneralProposalType, GeneralServicePricingMode, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type GeneralProposalPdfData = {
  proposalNumber: string;
  title: string;
  proposalType: GeneralProposalType;
  currency: string;
  createdAt: Date;
  validUntil: Date | null;
  executiveSummary: string;
  contextText: string;
  projectScope: string;
  paymentTerms: string | null;
  commercialNotes: string | null;
  customer: {
    companyName: string;
    tradeName: string | null;
  };
  vendor: {
    name: string;
    aboutText: string;
  };
  products: Array<{
    id: string;
    productName: string;
    description: string | null;
    sku: string | null;
    quantity: string;
    licenseTermMonths: number | null;
    finalItemPrice: string;
  }>;
  services: Array<{
    id: string;
    serviceName: string;
    description: string | null;
    serviceType: string;
    pricingMode: GeneralServicePricingMode;
    estimatedHours: string;
    totalSalePrice: string;
  }>;
  investment: {
    subtotalProducts: string;
    subtotalServices: string;
    totalDiscount: string;
    finalPrice: string;
  };
};

const DEFAULT_EXECUTIVE_SUMMARY =
  "Esta proposta tem como objetivo apresentar a solução recomendada pela Partsec para atender às necessidades de segurança, continuidade operacional e modernização tecnológica do ambiente do cliente.";

const DEFAULT_SCOPE =
  "O escopo detalhado será definido conforme os produtos e serviços descritos nesta proposta.";

const proposalTypeContexts: Record<GeneralProposalType, string> = {
  NEW_SALE: "Esta proposta contempla uma nova contratação de solução ou serviço.",
  RENEWAL: "Esta proposta contempla a renovação de licenciamento ou serviços existentes.",
  UPGRADE: "Esta proposta contempla evolução, upgrade ou ampliação da solução atual.",
  REPLACEMENT: "Esta proposta contempla substituição de solução ou fornecedor atual.",
  EXPANSION: "Esta proposta contempla expansão do ambiente licenciado ou contratado.",
  IMPLEMENTATION: "Esta proposta contempla serviços de implantação e configuração.",
  PROJECT: "Esta proposta contempla projeto técnico especializado.",
  OTHER: "Esta proposta contempla uma solução comercial definida conforme as necessidades apresentadas pelo cliente.",
};

function sum(values: Prisma.Decimal[]) {
  return values.reduce(
    (total, value) => total.plus(value),
    new Prisma.Decimal(0)
  );
}

export async function getGeneralProposalPdfData(
  id: string
): Promise<GeneralProposalPdfData | null> {
  const proposal = await prisma.generalProposal.findFirst({
    where: { id, deletedAt: null },
    select: {
      proposalNumber: true,
      title: true,
      proposalType: true,
      currency: true,
      createdAt: true,
      validUntil: true,
      executiveSummary: true,
      projectScope: true,
      paymentTerms: true,
      commercialNotes: true,
      customer: {
        select: { companyName: true, tradeName: true },
      },
      vendor: {
        select: {
          name: true,
          aboutText: true,
          shortDescription: true,
        },
      },
      items: {
        where: { isVisibleToClient: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          productName: true,
          description: true,
          sku: true,
          quantity: true,
          licenseTermMonths: true,
          totalSalePrice: true,
          finalItemPrice: true,
          totalDiscount: true,
        },
      },
      services: {
        where: { isVisibleToClient: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          serviceName: true,
          description: true,
          serviceType: true,
          pricingMode: true,
          estimatedHours: true,
          totalSalePrice: true,
        },
      },
    },
  });

  if (!proposal) return null;

  const subtotalProducts = sum(
    proposal.items.map((item) => item.totalSalePrice)
  );
  const subtotalServices = sum(
    proposal.services.map((service) => service.totalSalePrice)
  );
  const totalDiscount = sum(
    proposal.items.map((item) => item.totalDiscount)
  );

  return {
    proposalNumber: proposal.proposalNumber,
    title: proposal.title,
    proposalType: proposal.proposalType,
    currency: proposal.currency,
    createdAt: proposal.createdAt,
    validUntil: proposal.validUntil,
    executiveSummary:
      proposal.executiveSummary?.trim() || DEFAULT_EXECUTIVE_SUMMARY,
    contextText: proposalTypeContexts[proposal.proposalType],
    projectScope: proposal.projectScope?.trim() || DEFAULT_SCOPE,
    paymentTerms: proposal.paymentTerms,
    commercialNotes: proposal.commercialNotes,
    customer: proposal.customer,
    vendor: {
      name: proposal.vendor.name,
      aboutText:
        proposal.vendor.aboutText?.trim() ||
        proposal.vendor.shortDescription?.trim() ||
        `Fabricante selecionado para compor a solução proposta pela Partsec, conforme escopo técnico e comercial apresentado neste documento.`,
    },
    products: proposal.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      description: item.description,
      sku: item.sku,
      quantity: item.quantity.toString(),
      licenseTermMonths: item.licenseTermMonths,
      finalItemPrice: item.finalItemPrice.toString(),
    })),
    services: proposal.services.map((service) => ({
      id: service.id,
      serviceName: service.serviceName,
      description: service.description,
      serviceType: service.serviceType,
      pricingMode: service.pricingMode,
      estimatedHours: service.estimatedHours.toString(),
      totalSalePrice: service.totalSalePrice.toString(),
    })),
    investment: {
      subtotalProducts: subtotalProducts.toFixed(2),
      subtotalServices: subtotalServices.toFixed(2),
      totalDiscount: totalDiscount.toFixed(2),
      finalPrice: subtotalProducts
        .minus(totalDiscount)
        .plus(subtotalServices)
        .toFixed(2),
    },
  };
}
