import {
  ModuleType,
  PrismaClient,
  ProposalPlan,
  UnitType,
} from "@prisma/client";

const prisma = new PrismaClient();

type PriceTierLabel = "MICRO" | "SMALL" | "MEDIUM" | "LARGE";

type PricingTier = {
  plan: ProposalPlan;
  moduleType: ModuleType;
  unitType: UnitType;
  rangeLabel: PriceTierLabel;
  minQuantity: number;
  maxQuantity: number;
  monthlyPrice: number;
  setupPrice: number;
};

const PLANS = [
  ProposalPlan.BASIC,
  ProposalPlan.PROFESSIONAL,
  ProposalPlan.ADVANCED,
] as const;

const TARGET_MODULES = [
  ModuleType.INFRASTRUCTURE,
  ModuleType.ENDPOINT_SECURITY,
  ModuleType.CLOUD_SERVICES,
] as const;

const MODULE_TIERS: Record<
  (typeof TARGET_MODULES)[number],
  Array<Omit<PricingTier, "plan" | "moduleType" | "unitType">>
> = {
  [ModuleType.INFRASTRUCTURE]: [
    { rangeLabel: "MICRO", minQuantity: 1, maxQuantity: 10, monthlyPrice: 497, setupPrice: 400 },
    { rangeLabel: "SMALL", minQuantity: 11, maxQuantity: 25, monthlyPrice: 797, setupPrice: 700 },
    { rangeLabel: "MEDIUM", minQuantity: 26, maxQuantity: 75, monthlyPrice: 1297, setupPrice: 1200 },
    { rangeLabel: "LARGE", minQuantity: 76, maxQuantity: 150, monthlyPrice: 1997, setupPrice: 1800 },
  ],
  [ModuleType.ENDPOINT_SECURITY]: [
    { rangeLabel: "MICRO", minQuantity: 1, maxQuantity: 25, monthlyPrice: 297, setupPrice: 300 },
    { rangeLabel: "SMALL", minQuantity: 26, maxQuantity: 150, monthlyPrice: 497, setupPrice: 500 },
    { rangeLabel: "MEDIUM", minQuantity: 151, maxQuantity: 500, monthlyPrice: 997, setupPrice: 1000 },
    { rangeLabel: "LARGE", minQuantity: 501, maxQuantity: 1000, monthlyPrice: 1797, setupPrice: 1800 },
  ],
  [ModuleType.CLOUD_SERVICES]: [
    { rangeLabel: "MICRO", minQuantity: 1, maxQuantity: 25, monthlyPrice: 247, setupPrice: 250 },
    { rangeLabel: "SMALL", minQuantity: 26, maxQuantity: 150, monthlyPrice: 397, setupPrice: 400 },
    { rangeLabel: "MEDIUM", minQuantity: 151, maxQuantity: 500, monthlyPrice: 797, setupPrice: 800 },
    { rangeLabel: "LARGE", minQuantity: 501, maxQuantity: 1000, monthlyPrice: 1397, setupPrice: 1400 },
  ],
};

const MODULE_UNIT_TYPES: Record<(typeof TARGET_MODULES)[number], UnitType> = {
  [ModuleType.INFRASTRUCTURE]: UnitType.ASSET,
  [ModuleType.ENDPOINT_SECURITY]: UnitType.ENDPOINT,
  [ModuleType.CLOUD_SERVICES]: UnitType.USER,
};

function buildPricingTiers(): PricingTier[] {
  return PLANS.flatMap((plan) =>
    TARGET_MODULES.flatMap((moduleType) =>
      MODULE_TIERS[moduleType].map((tier) => ({
        ...tier,
        plan,
        moduleType,
        unitType: MODULE_UNIT_TYPES[moduleType],
      }))
    )
  );
}

function tierKey(tier: Pick<PricingTier, "plan" | "moduleType" | "minQuantity" | "maxQuantity">) {
  return [
    tier.plan,
    tier.moduleType,
    tier.minQuantity,
    tier.maxQuantity,
  ].join(":");
}

async function main() {
  const desiredTiers = buildPricingTiers();
  const desiredKeys = new Set(desiredTiers.map(tierKey));

  const existingTiers = await prisma.priceTable.findMany({
    where: {
      plan: { in: [...PLANS] },
      moduleType: { in: [...TARGET_MODULES] },
    },
    select: {
      plan: true,
      moduleType: true,
      minQuantity: true,
      maxQuantity: true,
    },
  });

  const staleTiers = existingTiers.filter((tier) => !desiredKeys.has(tierKey(tier)));

  await prisma.$transaction([
    ...desiredTiers.map((tier) =>
      prisma.priceTable.upsert({
        where: {
          PriceTable_plan_moduleType_minQuantity_maxQuantity_key: {
            plan: tier.plan,
            moduleType: tier.moduleType,
            minQuantity: tier.minQuantity,
            maxQuantity: tier.maxQuantity,
          },
        },
        update: {
          unitType: tier.unitType,
          rangeLabel: tier.rangeLabel,
          monthlyPrice: tier.monthlyPrice.toString(),
          setupPrice: tier.setupPrice.toString(),
          active: true,
        },
        create: {
          plan: tier.plan,
          moduleType: tier.moduleType,
          unitType: tier.unitType,
          rangeLabel: tier.rangeLabel,
          minQuantity: tier.minQuantity,
          maxQuantity: tier.maxQuantity,
          monthlyPrice: tier.monthlyPrice.toString(),
          setupPrice: tier.setupPrice.toString(),
          active: true,
        },
      })
    ),
    ...staleTiers.map((tier) =>
      prisma.priceTable.updateMany({
        where: {
          plan: tier.plan,
          moduleType: tier.moduleType,
          minQuantity: tier.minQuantity,
          maxQuantity: tier.maxQuantity,
        },
        data: {
          active: false,
        },
      })
    ),
  ]);

  console.log(`Pricing tiers upserted: ${desiredTiers.length}`);
  console.log(`Stale tiers disabled: ${staleTiers.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
