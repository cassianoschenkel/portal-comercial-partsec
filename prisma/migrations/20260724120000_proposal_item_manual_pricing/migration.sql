-- CreateEnum
CREATE TYPE "ProposalItemPricingMode" AS ENUM ('AUTO', 'MANUAL');

-- AlterTable
ALTER TABLE "ProposalItem"
ADD COLUMN "pricingMode" "ProposalItemPricingMode" NOT NULL DEFAULT 'AUTO',
ADD COLUMN "manualMonthlyPrice" DECIMAL(10, 2),
ADD COLUMN "manualSetupPrice" DECIMAL(10, 2),
ADD COLUMN "pricingJustification" TEXT;

-- CreateIndex
CREATE INDEX "ProposalItem_pricingMode_idx" ON "ProposalItem"("pricingMode");
