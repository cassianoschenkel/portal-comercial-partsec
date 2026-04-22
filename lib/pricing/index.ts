import { ProposalPlan } from "@prisma/client";

type PricingTier = {
  min: number;
  max: number;
  monthlyPrice: number;
  setupFee: number;
  tierLabel: "S" | "M" | "L" | "XL";
};

const PRICING_TABLE: Record<ProposalPlan, PricingTier[]> = {
  ESSENTIAL: [
    { min: 0, max: 10, monthlyPrice: 297, setupFee: 400, tierLabel: "S" },
    { min: 11, max: 25, monthlyPrice: 397, setupFee: 650, tierLabel: "M" },
    { min: 26, max: 50, monthlyPrice: 497, setupFee: 1000, tierLabel: "L" },
    { min: 51, max: 100, monthlyPrice: 597, setupFee: 1500, tierLabel: "XL" },
  ],
  PROFESSIONAL: [
    { min: 0, max: 10, monthlyPrice: 597, setupFee: 400, tierLabel: "S" },
    { min: 11, max: 25, monthlyPrice: 697, setupFee: 650, tierLabel: "M" },
    { min: 26, max: 50, monthlyPrice: 897, setupFee: 1000, tierLabel: "L" },
    { min: 51, max: 100, monthlyPrice: 1097, setupFee: 1500, tierLabel: "XL" },
  ],
  ENTERPRISE: [
    { min: 0, max: 10, monthlyPrice: 1097, setupFee: 400, tierLabel: "S" },
    { min: 11, max: 25, monthlyPrice: 1297, setupFee: 650, tierLabel: "M" },
    { min: 26, max: 50, monthlyPrice: 1597, setupFee: 1000, tierLabel: "L" },
    { min: 51, max: 100, monthlyPrice: 1997, setupFee: 1500, tierLabel: "XL" },
  ],
};

export const MAX_DISCOUNT_PERCENT = 20;
export const PARTNER_COMMISSION_PERCENT = 30;

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

export function getPricingByPlanAndActiveCount(
  plan: ProposalPlan,
  activeCount: number
) {
  const tiers = PRICING_TABLE[plan];

  const tier = tiers.find(({ min, max }) => {
    return activeCount >= min && activeCount <= max;
  });

  if (!tier) {
    throw new Error("Nenhuma faixa de preço encontrada para esta quantidade de ativos.");
  }

  return tier;
}

export function calculatePartnerCommission(
  total: number,
  commissionPercent: number = PARTNER_COMMISSION_PERCENT
) {
  return roundCurrency((total * commissionPercent) / 100);
}

export function calculateProposalTotals(params: {
  plan: ProposalPlan;
  activeCount: number;
  discountPercent: number;
  commissionPercent?: number;
}) {
  const { plan, activeCount, discountPercent } = params;
  const commissionPercent =
    params.commissionPercent ?? PARTNER_COMMISSION_PERCENT;

  if (activeCount <= 0) {
    throw new Error("A quantidade de ativos deve ser maior que zero.");
  }

  if (discountPercent < 0 || discountPercent > MAX_DISCOUNT_PERCENT) {
    throw new Error(
      `O desconto deve estar entre 0 e ${MAX_DISCOUNT_PERCENT}%.`
    );
  }

  const tier = getPricingByPlanAndActiveCount(plan, activeCount);

  const subtotal = roundCurrency(tier.monthlyPrice);
  const discountValue = roundCurrency((subtotal * discountPercent) / 100);
  const total = roundCurrency(subtotal - discountValue);
  const partnerCommissionValue = calculatePartnerCommission(
    total,
    commissionPercent
  );

  const unitPrice = roundCurrency(subtotal / activeCount);

  return {
    tierLabel: tier.tierLabel,
    unitPrice,
    subtotal,
    setupFee: roundCurrency(tier.setupFee),
    discountPercent: roundCurrency(discountPercent),
    discountValue,
    total,
    partnerCommissionPercent: roundCurrency(commissionPercent),
    partnerCommissionValue,
  };
}