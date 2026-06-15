import {
  ModuleType,
  PriceTable,
  ProposalPlan,
  UnitType,
  UserRole,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

const MAX_PARTNER_DISCOUNT_PERCENT = 10;

const MODULE_LABELS: Record<ModuleType, string> = {
  INFRASTRUCTURE: "Infraestrutura",
  ENDPOINT_SECURITY: "Endpoint Security",
  CLOUD_SERVICES: "Cloud Services",
  FIREWALL: "Firewall",
  WEB_MONITORING: "Monitoramento Web",
};

const MODULE_UNIT_TYPES: Record<ModuleType, UnitType> = {
  INFRASTRUCTURE: UnitType.ASSET,
  ENDPOINT_SECURITY: UnitType.ENDPOINT,
  CLOUD_SERVICES: UnitType.USER,
  FIREWALL: UnitType.FIREWALL,
  WEB_MONITORING: UnitType.URL,
};

export type PricingModuleInput = {
  moduleType: ModuleType;
  quantity: number;
};

export type CalculateProposalPricingInput = {
  plan: ProposalPlan;
  modules: PricingModuleInput[];
  discountPercent?: number;
  discountAmount?: number;
  partnerCommissionPct?: number;
  role?: UserRole | "ADMIN" | "PARTNER";
};

export type CalculatedProposalItem = {
  moduleType: ModuleType;
  unitType: UnitType;
  description: string;
  quantity: number;
  rangeLabel: string;
  monthlyPrice: number;
  setupPrice: number;
};

export type CalculatedProposalPricing = {
  items: CalculatedProposalItem[];
  monthlySubtotal: number;
  setupSubtotal: number;
  discountPercent: number;
  discountAmount: number;
  finalMonthlyPrice: number;
  finalSetupPrice: number;
  firstMonthTotal: number;
  partnerCommissionPct: number;
  partnerCommission: number;
  partsecNetRevenue: number;
};

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

function assertPositiveQuantity(moduleType: ModuleType, quantity: number) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error(
      `A quantidade do módulo ${MODULE_LABELS[moduleType]} deve ser maior que zero.`
    );
  }
}

function normalizePercent(value?: number) {
  return roundCurrency(value ?? 0);
}

function resolveDiscountAmount(params: {
  monthlySubtotal: number;
  discountPercent: number;
  discountAmount: number;
}) {
  const { monthlySubtotal, discountPercent, discountAmount } = params;

  if (discountAmount > 0) {
    if (discountAmount > monthlySubtotal) {
      throw new Error("O desconto não pode ser maior que o valor mensal da proposta.");
    }

    return roundCurrency(discountAmount);
  }

  return roundCurrency((monthlySubtotal * discountPercent) / 100);
}

function resolveEffectiveDiscountPercent(params: {
  monthlySubtotal: number;
  discountAmount: number;
  discountPercent: number;
}) {
  const { monthlySubtotal, discountAmount, discountPercent } = params;

  if (discountAmount > 0) {
    return monthlySubtotal === 0
      ? 0
      : roundCurrency((discountAmount / monthlySubtotal) * 100);
  }

  return roundCurrency(discountPercent);
}

function findMatchingPriceRow(
  rows: PriceTable[],
  moduleType: ModuleType,
  quantity: number
) {
  return rows.find((row) => {
    return (
      row.moduleType === moduleType &&
      row.active &&
      quantity >= row.minQuantity &&
      quantity <= row.maxQuantity
    );
  });
}

export async function calculateProposalPricing(
  input: CalculateProposalPricingInput
): Promise<CalculatedProposalPricing> {
  const role = input.role ?? "PARTNER";
  const discountPercent = normalizePercent(input.discountPercent);
  const requestedDiscountAmount = roundCurrency(input.discountAmount ?? 0);
  const partnerCommissionPct = normalizePercent(input.partnerCommissionPct);

  if (input.modules.length === 0) {
    throw new Error("Informe ao menos um módulo para calcular a proposta.");
  }

  if (discountPercent < 0 || requestedDiscountAmount < 0) {
    throw new Error("Os valores de desconto não podem ser negativos.");
  }

  if (role === "PARTNER" && discountPercent > MAX_PARTNER_DISCOUNT_PERCENT) {
    throw new Error(
      `Usuários parceiros não podem aplicar desconto percentual acima de ${MAX_PARTNER_DISCOUNT_PERCENT}%.`
    );
  }

  const activePriceRows = await prisma.priceTable.findMany({
    where: {
      plan: input.plan,
      active: true,
      moduleType: {
        in: input.modules.map((module) => module.moduleType),
      },
    },
    orderBy: [
      { moduleType: "asc" },
      { minQuantity: "asc" },
    ],
  });

  const items = input.modules.map((module) => {
    assertPositiveQuantity(module.moduleType, module.quantity);

    const priceRow = findMatchingPriceRow(
      activePriceRows,
      module.moduleType,
      module.quantity
    );

    if (!priceRow) {
      throw new Error(
        `Não existe tabela de preço ativa para ${MODULE_LABELS[module.moduleType]} na quantidade informada.`
      );
    }

    return {
      moduleType: module.moduleType,
      unitType: priceRow.unitType,
      description: MODULE_LABELS[module.moduleType],
      quantity: module.quantity,
      rangeLabel: priceRow.rangeLabel,
      monthlyPrice: roundCurrency(Number(priceRow.monthlyPrice)),
      setupPrice: roundCurrency(Number(priceRow.setupPrice)),
    };
  });

  const monthlySubtotal = roundCurrency(
    items.reduce((total, item) => total + item.monthlyPrice, 0)
  );
  const setupSubtotal = roundCurrency(
    items.reduce((total, item) => total + item.setupPrice, 0)
  );
  const discountAmount = resolveDiscountAmount({
    monthlySubtotal,
    discountPercent,
    discountAmount: requestedDiscountAmount,
  });
  const effectiveDiscountPercent = resolveEffectiveDiscountPercent({
    monthlySubtotal,
    discountAmount,
    discountPercent,
  });

  if (
    role === "PARTNER" &&
    effectiveDiscountPercent > MAX_PARTNER_DISCOUNT_PERCENT
  ) {
    throw new Error(
      `Usuários parceiros não podem aplicar desconto percentual acima de ${MAX_PARTNER_DISCOUNT_PERCENT}%.`
    );
  }

  const finalMonthlyPrice = roundCurrency(monthlySubtotal - discountAmount);
  const finalSetupPrice = roundCurrency(setupSubtotal);
  const firstMonthTotal = roundCurrency(finalMonthlyPrice + finalSetupPrice);
  const partnerCommission = roundCurrency(
    (finalMonthlyPrice * partnerCommissionPct) / 100
  );
  const partsecNetRevenue = roundCurrency(finalMonthlyPrice - partnerCommission);

  return {
    items,
    monthlySubtotal,
    setupSubtotal,
    discountPercent: effectiveDiscountPercent,
    discountAmount,
    finalMonthlyPrice,
    finalSetupPrice,
    firstMonthTotal,
    partnerCommissionPct,
    partnerCommission,
    partsecNetRevenue,
  };
}

export function getUnitTypeForModule(moduleType: ModuleType) {
  return MODULE_UNIT_TYPES[moduleType];
}

export function getModuleLabel(moduleType: ModuleType) {
  return MODULE_LABELS[moduleType];
}

export { MAX_PARTNER_DISCOUNT_PERCENT };
