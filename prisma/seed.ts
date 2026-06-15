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
  rangeLabel: "S" | "M" | "L" | "XL";
  minQuantity: number;
  maxQuantity: number;
  monthlyPrice: number;
  setupPrice: number;
  active: boolean;
};

const infraRanges = [
  { rangeLabel: "S" as const, minQuantity: 0, maxQuantity: 10 },
  { rangeLabel: "M" as const, minQuantity: 11, maxQuantity: 25 },
  { rangeLabel: "L" as const, minQuantity: 26, maxQuantity: 50 },
  { rangeLabel: "XL" as const, minQuantity: 51, maxQuantity: 100 },
];

const endpointRanges = [
  { rangeLabel: "S" as const, minQuantity: 0, maxQuantity: 25 },
  { rangeLabel: "M" as const, minQuantity: 26, maxQuantity: 75 },
  { rangeLabel: "L" as const, minQuantity: 76, maxQuantity: 150 },
  { rangeLabel: "XL" as const, minQuantity: 151, maxQuantity: 300 },
];

const cloudRanges = endpointRanges;

function buildRows(params: {
  plan: ProposalPlan;
  moduleType: ModuleType;
  unitType: UnitType;
  ranges: ReadonlyArray<{
    rangeLabel: "S" | "M" | "L" | "XL";
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
    monthlyPrices: [297, 397, 497, 597],
    setupPrices: [400, 650, 1000, 1500],
  }),
  ...buildRows({
    plan: ProposalPlan.PROFESSIONAL,
    moduleType: ModuleType.INFRASTRUCTURE,
    unitType: UnitType.ASSET,
    ranges: infraRanges,
    monthlyPrices: [597, 697, 897, 1097],
    setupPrices: [400, 650, 1000, 1500],
  }),
  ...buildRows({
    plan: ProposalPlan.ADVANCED,
    moduleType: ModuleType.INFRASTRUCTURE,
    unitType: UnitType.ASSET,
    ranges: infraRanges,
    monthlyPrices: [1097, 1297, 1597, 1997],
    setupPrices: [400, 650, 1000, 1500],
  }),
  ...buildRows({
    plan: ProposalPlan.BASIC,
    moduleType: ModuleType.ENDPOINT_SECURITY,
    unitType: UnitType.ENDPOINT,
    ranges: endpointRanges,
    monthlyPrices: [497, 697, 997, 1297],
    setupPrices: [500, 750, 1100, 1600],
  }),
  ...buildRows({
    plan: ProposalPlan.PROFESSIONAL,
    moduleType: ModuleType.ENDPOINT_SECURITY,
    unitType: UnitType.ENDPOINT,
    ranges: endpointRanges,
    monthlyPrices: [797, 1097, 1497, 1997],
    setupPrices: [600, 900, 1300, 1800],
  }),
  ...buildRows({
    plan: ProposalPlan.ADVANCED,
    moduleType: ModuleType.ENDPOINT_SECURITY,
    unitType: UnitType.ENDPOINT,
    ranges: endpointRanges,
    monthlyPrices: [1197, 1597, 2197, 2897],
    setupPrices: [700, 1000, 1500, 2000],
  }),
  ...buildRows({
    plan: ProposalPlan.BASIC,
    moduleType: ModuleType.CLOUD_SERVICES,
    unitType: UnitType.USER,
    ranges: cloudRanges,
    monthlyPrices: [397, 597, 797, 1097],
    setupPrices: [450, 700, 1000, 1400],
  }),
  ...buildRows({
    plan: ProposalPlan.PROFESSIONAL,
    moduleType: ModuleType.CLOUD_SERVICES,
    unitType: UnitType.USER,
    ranges: cloudRanges,
    monthlyPrices: [697, 897, 1197, 1597],
    setupPrices: [550, 800, 1150, 1550],
  }),
  ...buildRows({
    plan: ProposalPlan.ADVANCED,
    moduleType: ModuleType.CLOUD_SERVICES,
    unitType: UnitType.USER,
    ranges: cloudRanges,
    monthlyPrices: [997, 1297, 1697, 2297],
    setupPrices: [650, 900, 1300, 1700],
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
