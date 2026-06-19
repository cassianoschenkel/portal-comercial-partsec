import {
  ModuleType,
  PrismaClient,
  ProposalPlan,
  UnitType,
  UserRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type PriceSeedRow = {
  plan: ProposalPlan;
  moduleType: ModuleType;
  unitType: UnitType;
  rangeLabel: "MICRO" | "SMALL" | "MEDIUM" | "LARGE";
  minQuantity: number;
  maxQuantity: number;
  monthlyPrice: number;
  setupPrice: number;
  active: boolean;
};

const infraRanges = [
  { rangeLabel: "MICRO" as const, minQuantity: 1, maxQuantity: 10 },
  { rangeLabel: "SMALL" as const, minQuantity: 11, maxQuantity: 25 },
  { rangeLabel: "MEDIUM" as const, minQuantity: 26, maxQuantity: 75 },
  { rangeLabel: "LARGE" as const, minQuantity: 76, maxQuantity: 150 },
];

const endpointRanges = [
  { rangeLabel: "MICRO" as const, minQuantity: 1, maxQuantity: 25 },
  { rangeLabel: "SMALL" as const, minQuantity: 26, maxQuantity: 150 },
  { rangeLabel: "MEDIUM" as const, minQuantity: 151, maxQuantity: 500 },
  { rangeLabel: "LARGE" as const, minQuantity: 501, maxQuantity: 1000 },
];

const cloudRanges = endpointRanges;

function buildRows(params: {
  plan: ProposalPlan;
  moduleType: ModuleType;
  unitType: UnitType;
  ranges: ReadonlyArray<{
    rangeLabel: "MICRO" | "SMALL" | "MEDIUM" | "LARGE";
    minQuantity: number;
    maxQuantity: number;
  }>;
  monthlyPrices: [number, number, number, number];
  setupPrices: [number, number, number, number];
}): PriceSeedRow[] {
  return params.ranges.map((range, index) => ({
    plan: params.plan,
    moduleType: params.moduleType,
    unitType: params.unitType,
    rangeLabel: range.rangeLabel,
    minQuantity: range.minQuantity,
    maxQuantity: range.maxQuantity,
    monthlyPrice: params.monthlyPrices[index],
    setupPrice: params.setupPrices[index],
    active: true,
  }));
}

const priceRows: PriceSeedRow[] = [
  ...buildRows({
    plan: ProposalPlan.BASIC,
    moduleType: ModuleType.INFRASTRUCTURE,
    unitType: UnitType.ASSET,
    ranges: infraRanges,
    monthlyPrices: [497, 797, 1297, 1997],
    setupPrices: [400, 700, 1200, 1800],
  }),
  ...buildRows({
    plan: ProposalPlan.PROFESSIONAL,
    moduleType: ModuleType.INFRASTRUCTURE,
    unitType: UnitType.ASSET,
    ranges: infraRanges,
    monthlyPrices: [497, 797, 1297, 1997],
    setupPrices: [400, 700, 1200, 1800],
  }),
  ...buildRows({
    plan: ProposalPlan.ADVANCED,
    moduleType: ModuleType.INFRASTRUCTURE,
    unitType: UnitType.ASSET,
    ranges: infraRanges,
    monthlyPrices: [497, 797, 1297, 1997],
    setupPrices: [400, 700, 1200, 1800],
  }),
  ...buildRows({
    plan: ProposalPlan.BASIC,
    moduleType: ModuleType.ENDPOINT_SECURITY,
    unitType: UnitType.ENDPOINT,
    ranges: endpointRanges,
    monthlyPrices: [297, 497, 997, 1797],
    setupPrices: [300, 500, 1000, 1800],
  }),
  ...buildRows({
    plan: ProposalPlan.PROFESSIONAL,
    moduleType: ModuleType.ENDPOINT_SECURITY,
    unitType: UnitType.ENDPOINT,
    ranges: endpointRanges,
    monthlyPrices: [297, 497, 997, 1797],
    setupPrices: [300, 500, 1000, 1800],
  }),
  ...buildRows({
    plan: ProposalPlan.ADVANCED,
    moduleType: ModuleType.ENDPOINT_SECURITY,
    unitType: UnitType.ENDPOINT,
    ranges: endpointRanges,
    monthlyPrices: [297, 497, 997, 1797],
    setupPrices: [300, 500, 1000, 1800],
  }),
  ...buildRows({
    plan: ProposalPlan.BASIC,
    moduleType: ModuleType.CLOUD_SERVICES,
    unitType: UnitType.USER,
    ranges: cloudRanges,
    monthlyPrices: [247, 397, 797, 1397],
    setupPrices: [250, 400, 800, 1400],
  }),
  ...buildRows({
    plan: ProposalPlan.PROFESSIONAL,
    moduleType: ModuleType.CLOUD_SERVICES,
    unitType: UnitType.USER,
    ranges: cloudRanges,
    monthlyPrices: [247, 397, 797, 1397],
    setupPrices: [250, 400, 800, 1400],
  }),
  ...buildRows({
    plan: ProposalPlan.ADVANCED,
    moduleType: ModuleType.CLOUD_SERVICES,
    unitType: UnitType.USER,
    ranges: cloudRanges,
    monthlyPrices: [247, 397, 797, 1397],
    setupPrices: [250, 400, 800, 1400],
  }),
];

async function main() {
  const adminPasswordHash = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@partsec.com.br" },
    update: {
      passwordHash: adminPasswordHash,
      name: "Admin Partsec",
      role: UserRole.ADMIN,
    },
    create: {
      name: "Admin Partsec",
      email: "admin@partsec.com.br",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
    },
  });

  await prisma.customer.upsert({
    where: { document: "12.345.678/0001-90" },
    update: {},
    create: {
      companyName: "Acme Tecnologia Ltda",
      tradeName: "Acme Tech",
      document: "12.345.678/0001-90",
      contactName: "Marina Costa",
      contactEmail: "marina.costa@acmetech.com.br",
      contactPhone: "(11) 98888-0001",
      notes: "Cliente com interesse em monitoramento contínuo.",
    },
  });

  await prisma.customer.upsert({
    where: { document: "98.765.432/0001-10" },
    update: {},
    create: {
      companyName: "Norte Serviços Financeiros S.A.",
      tradeName: "Norte Finance",
      document: "98.765.432/0001-10",
      contactName: "Eduardo Ramos",
      contactEmail: "eduardo.ramos@nortefinance.com.br",
      contactPhone: "(21) 97777-0002",
      notes: "Precisa de proposta para 250 ativos.",
    },
  });

  await prisma.customer.upsert({
    where: { document: "45.111.222/0001-33" },
    update: {},
    create: {
      companyName: "Serra Logistica Integrada Ltda",
      tradeName: "Serra Log",
      document: "45.111.222/0001-33",
      contactName: "Patricia Lima",
      contactEmail: "patricia.lima@serralog.com.br",
      contactPhone: "(31) 96666-0003",
      notes: "Parceiro pediu retorno apos apresentacao comercial.",
    },
  });

  await prisma.priceTable.deleteMany();
  await prisma.priceTable.createMany({
    data: priceRows.map((row) => ({
      ...row,
      monthlyPrice: row.monthlyPrice.toString(),
      setupPrice: row.setupPrice.toString(),
    })),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
