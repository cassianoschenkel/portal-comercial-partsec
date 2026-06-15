CREATE TYPE "ModuleType" AS ENUM (
    'INFRASTRUCTURE',
    'ENDPOINT_SECURITY',
    'CLOUD_SERVICES',
    'FIREWALL',
    'WEB_MONITORING'
);

CREATE TYPE "UnitType" AS ENUM (
    'ASSET',
    'ENDPOINT',
    'USER',
    'FIREWALL',
    'URL',
    'TENANT'
);

ALTER TYPE "ProposalPlan" RENAME VALUE 'ESSENTIAL' TO 'BASIC';
ALTER TYPE "ProposalPlan" RENAME VALUE 'ENTERPRISE' TO 'ADVANCED';

CREATE TABLE "PriceTable" (
    "id" TEXT NOT NULL,
    "plan" "ProposalPlan" NOT NULL,
    "moduleType" "ModuleType" NOT NULL,
    "unitType" "UnitType" NOT NULL,
    "rangeLabel" TEXT NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "maxQuantity" INTEGER NOT NULL,
    "monthlyPrice" DECIMAL(10,2) NOT NULL,
    "setupPrice" DECIMAL(10,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceTable_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Proposal"
ADD COLUMN "monthlySubtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "setupSubtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "finalMonthlyPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "finalSetupPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "firstMonthTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "partnerCommissionPct" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN "partnerCommission" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "partsecNetRevenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "validityDays" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN "internalNotes" TEXT;

UPDATE "Proposal"
SET
    "monthlySubtotal" = "subtotal",
    "setupSubtotal" = "setupFee",
    "discountAmount" = "discountValue",
    "finalMonthlyPrice" = "total",
    "finalSetupPrice" = "setupFee",
    "firstMonthTotal" = "total" + "setupFee",
    "partnerCommissionPct" = "partnerCommissionPercent",
    "partnerCommission" = "partnerCommissionValue",
    "partsecNetRevenue" = ("total" + "setupFee") - "partnerCommissionValue";

CREATE TABLE "ProposalItem" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "moduleType" "ModuleType" NOT NULL,
    "unitType" "UnitType" NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "rangeLabel" TEXT NOT NULL,
    "monthlyPrice" DECIMAL(10,2) NOT NULL,
    "setupPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProposalItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PriceTable_plan_moduleType_minQuantity_maxQuantity_key"
ON "PriceTable"("plan", "moduleType", "minQuantity", "maxQuantity");

CREATE INDEX "PriceTable_plan_moduleType_active_idx"
ON "PriceTable"("plan", "moduleType", "active");

CREATE INDEX "PriceTable_unitType_idx"
ON "PriceTable"("unitType");

CREATE INDEX "ProposalItem_proposalId_idx"
ON "ProposalItem"("proposalId");

CREATE INDEX "ProposalItem_moduleType_idx"
ON "ProposalItem"("moduleType");

ALTER TABLE "ProposalItem"
ADD CONSTRAINT "ProposalItem_proposalId_fkey"
FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
