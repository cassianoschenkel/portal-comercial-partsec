import { Prisma } from "@prisma/client";

type DecimalValue = string | number | Prisma.Decimal;

export type GeneralProposalItemCalculationInput = {
  quantity: DecimalValue;
  costUnitPrice: DecimalValue;
  pricingMode: "MARGIN" | "MARKUP" | "MANUAL";
  marginPercent: DecimalValue;
  markupPercent: DecimalValue;
  discountPercent: DecimalValue;
  manualSaleUnitPrice?: DecimalValue;
};

export type GeneralProposalServiceCalculationInput = {
  pricingMode: "HOURLY" | "FIXED" | "MANUAL";
  estimatedHours: DecimalValue;
  internalHourlyCost: DecimalValue;
  saleHourlyRate: DecimalValue;
  fixedCost: DecimalValue;
  fixedSalePrice: DecimalValue;
};

const ZERO = new Prisma.Decimal(0);
const ONE_HUNDRED = new Prisma.Decimal(100);

function money(value: Prisma.Decimal) {
  return value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

function percentage(value: Prisma.Decimal) {
  return value.toDecimalPlaces(4, Prisma.Decimal.ROUND_HALF_UP);
}

function sum(values: Prisma.Decimal[]) {
  return values.reduce((total, value) => total.plus(value), ZERO);
}

export function calculateGeneralProposalItem(
  input: GeneralProposalItemCalculationInput
) {
  const quantity = new Prisma.Decimal(input.quantity).toDecimalPlaces(
    2,
    Prisma.Decimal.ROUND_HALF_UP
  );
  const costUnitPrice = money(new Prisma.Decimal(input.costUnitPrice));
  const requestedMargin = percentage(new Prisma.Decimal(input.marginPercent));
  const requestedMarkup = percentage(new Prisma.Decimal(input.markupPercent));
  const discountPercent = percentage(
    new Prisma.Decimal(input.discountPercent)
  );

  let saleUnitPrice: Prisma.Decimal;

  if (input.pricingMode === "MARGIN") {
    saleUnitPrice = costUnitPrice.div(
      ONE_HUNDRED.minus(requestedMargin).div(ONE_HUNDRED)
    );
  } else if (input.pricingMode === "MARKUP") {
    saleUnitPrice = costUnitPrice.mul(
      ONE_HUNDRED.plus(requestedMarkup).div(ONE_HUNDRED)
    );
  } else {
    saleUnitPrice = new Prisma.Decimal(input.manualSaleUnitPrice ?? 0);
  }

  saleUnitPrice = money(saleUnitPrice);
  const totalCost = money(quantity.mul(costUnitPrice));
  const totalSalePrice = money(quantity.mul(saleUnitPrice));
  const totalDiscount = money(
    totalSalePrice.mul(discountPercent).div(ONE_HUNDRED)
  );
  const finalItemPrice = money(totalSalePrice.minus(totalDiscount));
  const grossProfit = money(finalItemPrice.minus(totalCost));
  const grossMarginPercent = finalItemPrice.gt(0)
    ? percentage(grossProfit.div(finalItemPrice).mul(ONE_HUNDRED))
    : ZERO;
  const finalMarkupPercent = totalCost.gt(0)
    ? percentage(grossProfit.div(totalCost).mul(ONE_HUNDRED))
    : ZERO;

  return {
    quantity,
    costUnitPrice,
    marginPercent:
      input.pricingMode === "MARGIN" ? requestedMargin : ZERO,
    markupPercent: finalMarkupPercent,
    discountPercent,
    saleUnitPrice,
    totalCost,
    totalSalePrice,
    totalDiscount,
    finalItemPrice,
    grossProfit,
    grossMarginPercent,
  };
}

export function calculateGeneralProposalService(
  input: GeneralProposalServiceCalculationInput
) {
  const estimatedHours = new Prisma.Decimal(
    input.estimatedHours
  ).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
  const internalHourlyCost = money(
    new Prisma.Decimal(input.internalHourlyCost)
  );
  const saleHourlyRate = money(new Prisma.Decimal(input.saleHourlyRate));
  const fixedCost = money(new Prisma.Decimal(input.fixedCost));
  const fixedSalePrice = money(new Prisma.Decimal(input.fixedSalePrice));
  const isHourly = input.pricingMode === "HOURLY";
  const totalCost = isHourly
    ? money(estimatedHours.mul(internalHourlyCost))
    : fixedCost;
  const totalSalePrice = isHourly
    ? money(estimatedHours.mul(saleHourlyRate))
    : fixedSalePrice;
  const grossProfit = money(totalSalePrice.minus(totalCost));
  const grossMarginPercent = totalSalePrice.gt(0)
    ? percentage(grossProfit.div(totalSalePrice).mul(ONE_HUNDRED))
    : ZERO;

  return {
    estimatedHours: isHourly ? estimatedHours : ZERO,
    internalHourlyCost: isHourly ? internalHourlyCost : ZERO,
    saleHourlyRate: isHourly ? saleHourlyRate : ZERO,
    fixedCost: isHourly ? ZERO : fixedCost,
    fixedSalePrice: isHourly ? ZERO : fixedSalePrice,
    totalCost,
    totalSalePrice,
    grossProfit,
    grossMarginPercent,
  };
}

export async function recalculateGeneralProposalTotals(
  tx: Prisma.TransactionClient,
  proposalId: string
) {
  const [items, services] = await Promise.all([
    tx.generalProposalItem.findMany({
      where: { proposalId },
      select: {
        finalItemPrice: true,
        totalCost: true,
        totalSalePrice: true,
        totalDiscount: true,
      },
    }),
    tx.generalProposalService.findMany({
      where: { proposalId },
      select: { totalCost: true, totalSalePrice: true },
    }),
  ]);

  const subtotalProducts = money(
    sum(items.map((item) => item.finalItemPrice))
  );
  const subtotalServices = money(
    sum(services.map((service) => service.totalSalePrice))
  );
  const totalCost = money(
    sum([
      ...items.map((item) => item.totalCost),
      ...services.map((service) => service.totalCost),
    ])
  );
  const totalSalePrice = money(
    sum([
      ...items.map((item) => item.totalSalePrice),
      ...services.map((service) => service.totalSalePrice),
    ])
  );
  const totalDiscount = money(
    sum(items.map((item) => item.totalDiscount))
  );
  const finalPrice = money(subtotalProducts.plus(subtotalServices));
  const grossProfit = money(finalPrice.minus(totalCost));
  const grossMarginPercent = finalPrice.gt(0)
    ? percentage(grossProfit.div(finalPrice).mul(ONE_HUNDRED))
    : ZERO;
  const markupPercent = totalCost.gt(0)
    ? percentage(grossProfit.div(totalCost).mul(ONE_HUNDRED))
    : ZERO;

  await tx.generalProposal.update({
    where: { id: proposalId },
    data: {
      subtotalProducts,
      subtotalServices,
      totalCost,
      totalSalePrice,
      totalDiscount,
      finalPrice,
      grossProfit,
      grossMarginPercent,
      markupPercent,
    },
  });
}
