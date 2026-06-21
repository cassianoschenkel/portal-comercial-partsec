import { Prisma } from "@prisma/client";

type DecimalValue = string | number | Prisma.Decimal;

type SummaryProduct = {
  productName: string;
  sku: string | null;
  totalCost: DecimalValue;
  totalSalePrice: DecimalValue;
  totalDiscount: DecimalValue;
  finalItemPrice: DecimalValue;
  grossProfit: DecimalValue;
  grossMarginPercent: DecimalValue;
  isVisibleToClient: boolean;
};

type SummaryService = {
  serviceName: string;
  totalCost: DecimalValue;
  totalSalePrice: DecimalValue;
  grossProfit: DecimalValue;
  grossMarginPercent: DecimalValue;
  isVisibleToClient: boolean;
};

export type GeneralProposalSummaryInput = {
  customerId: string;
  vendorId: string;
  validUntil: Date | null;
  executiveSummary: string | null;
  projectScope: string | null;
  totalCost: DecimalValue;
  finalPrice: DecimalValue;
  grossMarginPercent: DecimalValue;
  vendor: { isActive: boolean };
  items: SummaryProduct[];
  services: SummaryService[];
};

export type InternalAlert = {
  level: "info" | "warning" | "danger";
  title: string;
  description: string;
};

export type ReadinessItem = {
  label: string;
  complete: boolean;
};

const ZERO = new Prisma.Decimal(0);
const ONE_HUNDRED = new Prisma.Decimal(100);

function decimal(value: DecimalValue) {
  return new Prisma.Decimal(value);
}

function sum(values: DecimalValue[]) {
  return values.reduce<Prisma.Decimal>(
    (total, value) => total.plus(value),
    ZERO
  );
}

function consolidatedMargin(sale: Prisma.Decimal, profit: Prisma.Decimal) {
  return sale.gt(0)
    ? profit
        .div(sale)
        .mul(ONE_HUNDRED)
        .toDecimalPlaces(4, Prisma.Decimal.ROUND_HALF_UP)
    : ZERO;
}

function lowestMargin<T extends { grossMarginPercent: DecimalValue }>(
  entries: T[]
) {
  return entries.reduce<T | null>((lowest, entry) => {
    if (!lowest) return entry;
    return decimal(entry.grossMarginPercent).lt(lowest.grossMarginPercent)
      ? entry
      : lowest;
  }, null);
}

export function getMarginHealth(marginPercent: DecimalValue) {
  const margin = decimal(marginPercent);

  if (margin.gte(25)) {
    return {
      level: "healthy" as const,
      label: "Saudável",
      description: "A proposta apresenta margem saudável para negociação.",
      suggestion: "Há espaço comercial moderado, mantendo atenção aos descontos adicionais.",
    };
  }

  if (margin.gte(15)) {
    return {
      level: "attention" as const,
      label: "Atenção",
      description: "A margem está em faixa aceitável, mas com pouca gordura para novos descontos.",
      suggestion: "Evite concessões adicionais sem revisar custos e preço final.",
    };
  }

  if (margin.gte(0)) {
    return {
      level: "low" as const,
      label: "Margem baixa",
      description: "A margem está abaixo do recomendado.",
      suggestion: "Avaliar reajuste de preço ou redução de desconto.",
    };
  }

  return {
    level: "negative" as const,
    label: "Margem negativa",
    description: "A proposta está abaixo do custo.",
    suggestion: "Revisão comercial recomendada antes de envio.",
  };
}

export function buildGeneralProposalAlerts(
  proposal: GeneralProposalSummaryInput
): InternalAlert[] {
  const alerts: InternalAlert[] = [];
  const productSale = sum(
    proposal.items.map((item) => item.totalSalePrice)
  );
  const productDiscount = sum(
    proposal.items.map((item) => item.totalDiscount)
  );
  const productsWithoutSku = proposal.items.filter((item) => !item.sku).length;
  const negativeProducts = proposal.items.filter((item) =>
    decimal(item.grossProfit).lt(0)
  ).length;
  const lowMarginProducts = proposal.items.filter(
    (item) =>
      decimal(item.grossProfit).gte(0) &&
      decimal(item.finalItemPrice).gt(0) &&
      decimal(item.grossMarginPercent).lt(15)
  ).length;
  const negativeServices = proposal.services.filter((service) =>
    decimal(service.grossProfit).lt(0)
  ).length;
  const lowMarginServices = proposal.services.filter(
    (service) =>
      decimal(service.grossProfit).gte(0) &&
      decimal(service.totalSalePrice).gt(0) &&
      decimal(service.grossMarginPercent).lt(15)
  ).length;
  const hiddenProducts = proposal.items.filter(
    (item) => !item.isVisibleToClient
  ).length;
  const hiddenServices = proposal.services.filter(
    (service) => !service.isVisibleToClient
  ).length;

  if (!proposal.validUntil) alerts.push({ level: "warning", title: "Proposta sem validade definida", description: "Defina uma data limite antes da revisão comercial." });
  if (!proposal.projectScope?.trim()) alerts.push({ level: "warning", title: "Escopo não preenchido", description: "O cliente precisa entender claramente o que está incluído." });
  if (!proposal.executiveSummary?.trim()) alerts.push({ level: "info", title: "Resumo executivo ausente", description: "Inclua uma síntese executiva para contextualizar a oferta." });
  if (proposal.items.length === 0 && proposal.services.length === 0) alerts.push({ level: "danger", title: "Proposta sem produtos e serviços", description: "Adicione ao menos uma entrega comercial à proposta." });
  if (productsWithoutSku > 0) alerts.push({ level: "info", title: "Produto sem SKU", description: `${productsWithoutSku} produto(s) não possuem SKU informado.` });
  if (lowMarginProducts > 0) alerts.push({ level: "warning", title: "Produto com margem abaixo de 15%", description: `${lowMarginProducts} produto(s) exigem atenção comercial.` });
  if (negativeProducts > 0) alerts.push({ level: "danger", title: "Produto com margem negativa", description: `${negativeProducts} produto(s) estão abaixo do custo.` });
  if (lowMarginServices > 0) alerts.push({ level: "warning", title: "Serviço com margem abaixo de 15%", description: `${lowMarginServices} serviço(s) exigem atenção comercial.` });
  if (negativeServices > 0) alerts.push({ level: "danger", title: "Serviço vendido abaixo do custo", description: `${negativeServices} serviço(s) possuem lucro negativo.` });
  if (productSale.gt(0) && productDiscount.div(productSale).mul(100).gt(20)) alerts.push({ level: "warning", title: "Desconto de produtos acima de 20%", description: "Revise a concessão comercial aplicada aos produtos." });
  if (decimal(proposal.totalCost).eq(0) && decimal(proposal.finalPrice).gt(0)) alerts.push({ level: "warning", title: "Custo total zerado", description: "Há valor de venda positivo sem custos registrados." });
  if (decimal(proposal.finalPrice).eq(0)) alerts.push({ level: "warning", title: "Valor final zerado", description: "A proposta ainda não possui valor comercial para envio." });
  if (!proposal.vendor.isActive) alerts.push({ level: "warning", title: "Fabricante principal inativo", description: "Confirme se o fabricante ainda deve compor esta oportunidade." });
  if (hiddenProducts > 0) alerts.push({ level: "info", title: "Item oculto do cliente", description: `${hiddenProducts} produto(s) estão marcados como internos.` });
  if (hiddenServices > 0) alerts.push({ level: "info", title: "Serviço oculto do cliente", description: `${hiddenServices} serviço(s) estão marcados como internos.` });

  return alerts;
}

export function buildGeneralProposalReadinessChecklist(
  proposal: GeneralProposalSummaryInput
) {
  const items: ReadinessItem[] = [
    { label: "Cliente selecionado", complete: Boolean(proposal.customerId) },
    { label: "Fabricante selecionado", complete: Boolean(proposal.vendorId) },
    { label: "Validade definida", complete: Boolean(proposal.validUntil) },
    { label: "Resumo executivo preenchido", complete: Boolean(proposal.executiveSummary?.trim()) },
    { label: "Escopo preenchido", complete: Boolean(proposal.projectScope?.trim()) },
    { label: "Pelo menos um produto ou serviço", complete: proposal.items.length + proposal.services.length > 0 },
    { label: "Valor final maior que zero", complete: decimal(proposal.finalPrice).gt(0) },
    { label: "Margem não negativa", complete: decimal(proposal.grossMarginPercent).gte(0) },
    { label: "Nenhum produto sem nome", complete: proposal.items.every((item) => Boolean(item.productName.trim())) },
    { label: "Nenhum serviço sem nome", complete: proposal.services.every((service) => Boolean(service.serviceName.trim())) },
  ];
  const coreComplete = items
    .filter((_, index) => [0, 1, 5, 6, 8, 9].includes(index))
    .every((item) => item.complete);
  const allComplete = items.every((item) => item.complete);

  return {
    items,
    status: allComplete
      ? ("ready" as const)
      : coreComplete
        ? ("attention" as const)
        : ("incomplete" as const),
    label: allComplete
      ? "Pronta para revisão"
      : coreComplete
        ? "Requer atenção"
        : "Incompleta",
  };
}

export function buildGeneralProposalInternalSummary(
  proposal: GeneralProposalSummaryInput
) {
  const productCost = sum(proposal.items.map((item) => item.totalCost));
  const productSale = sum(
    proposal.items.map((item) => item.finalItemPrice)
  );
  const productProfit = productSale.minus(productCost);
  const serviceCost = sum(proposal.services.map((service) => service.totalCost));
  const serviceSale = sum(
    proposal.services.map((service) => service.totalSalePrice)
  );
  const serviceProfit = serviceSale.minus(serviceCost);
  const lowestProduct = lowestMargin(proposal.items);
  const lowestService = lowestMargin(proposal.services);

  return {
    health: getMarginHealth(proposal.grossMarginPercent),
    alerts: buildGeneralProposalAlerts(proposal),
    readiness: buildGeneralProposalReadinessChecklist(proposal),
    products: {
      count: proposal.items.length,
      totalCost: productCost,
      totalSale: productSale,
      grossProfit: productProfit,
      grossMarginPercent: consolidatedMargin(productSale, productProfit),
      lowestMarginName: lowestProduct?.productName ?? null,
      lowestMarginPercent: lowestProduct
        ? decimal(lowestProduct.grossMarginPercent)
        : null,
      negativeCount: proposal.items.filter((item) =>
        decimal(item.grossProfit).lt(0)
      ).length,
    },
    services: {
      count: proposal.services.length,
      totalCost: serviceCost,
      totalSale: serviceSale,
      grossProfit: serviceProfit,
      grossMarginPercent: consolidatedMargin(serviceSale, serviceProfit),
      lowestMarginName: lowestService?.serviceName ?? null,
      lowestMarginPercent: lowestService
        ? decimal(lowestService.grossMarginPercent)
        : null,
      belowCostCount: proposal.services.filter((service) =>
        decimal(service.grossProfit).lt(0)
      ).length,
    },
  };
}
