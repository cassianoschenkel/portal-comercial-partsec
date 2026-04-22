import { ProposalPlan } from "@prisma/client";

type PricingTier = {
  min: number;
  max: number | null;
  unitPrice: number;
};

const PRICING_TABLE: Record<ProposalPlan, PricingTier[]> = {
  ESSENTIAL: [
    { min: 1, max: 50, unitPrice: 12 },
    { min: 51, max: 100, unitPrice: 10 },
    { min: 101, max: 250, unitPrice: 8 },
    { min: 251, max: null, unitPrice: 6 },
  ],
  PROFESSIONAL: [
    { min: 1, max: 50, unitPrice: 18 },
    { min: 51, max: 100, unitPrice: 16 },
    { min: 101, max: 250, unitPrice: 14 },
    { min: 251, max: null, unitPrice: 12 },
  ],
  ENTERPRISE: [
    { min: 1, max: 50, unitPrice: 28 },
    { min: 51, max: 100, unitPrice: 25 },
    { min: 101, max: 250, unitPrice: 22 },
    { min: 251, max: null, unitPrice: 19 },
  ],
};

export const MAX_DISCOUNT_PERCENT = 20;
export const PARTNER_COMMISSION_PERCENT = 30;

export function getPricingByPlanAndActiveCount(
  plan: ProposalPlan,
  activeCount: number
) {
  const tiers = PRICING_TABLE[plan];

  const tier = tiers.find(({ min, max }) => {
    const withinMin = activeCount >= min;
    const withinMax = max === null || activeCount <= max;
    return withinMin && withinMax;
  });

  if (!tier) {
    throw new Error("Nenhuma faixa de preço encontrada.");
  }

  return tier;
}

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
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

  const { unitPrice } = getPricingByPlanAndActiveCount(plan, activeCount);

  const subtotal = roundCurrency(unitPrice * activeCount);
  const discountValue = roundCurrency((subtotal * discountPercent) / 100);
  const total = roundCurrency(subtotal - discountValue);
  const partnerCommissionValue = calculatePartnerCommission(
    total,
    commissionPercent
  );

  return {
    unitPrice: roundCurrency(unitPrice),
    subtotal,
    discountPercent: roundCurrency(discountPercent),
    discountValue,
    total,
    partnerCommissionPercent: roundCurrency(commissionPercent),
    partnerCommissionValue,
  };
}
