-- CreateEnum
CREATE TYPE "CommissionBatchStatus" AS ENUM ('DRAFT', 'PAID', 'CANCELED');

-- AlterTable
ALTER TABLE "PartnerCommission" ADD COLUMN "batchId" TEXT;

-- CreateTable
CREATE TABLE "PartnerCommissionBatch" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "referenceMonth" TEXT,
    "status" "CommissionBatchStatus" NOT NULL DEFAULT 'DRAFT',
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "commissionCount" INTEGER NOT NULL,
    "paidAt" TIMESTAMP(3),
    "paidById" TEXT,
    "paymentReference" TEXT,
    "notes" TEXT,
    "canceledAt" TIMESTAMP(3),
    "canceledById" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerCommissionBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartnerCommission_batchId_idx" ON "PartnerCommission"("batchId");

-- CreateIndex
CREATE INDEX "PartnerCommissionBatch_partnerId_idx" ON "PartnerCommissionBatch"("partnerId");

-- CreateIndex
CREATE INDEX "PartnerCommissionBatch_status_idx" ON "PartnerCommissionBatch"("status");

-- CreateIndex
CREATE INDEX "PartnerCommissionBatch_periodStart_periodEnd_idx" ON "PartnerCommissionBatch"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "PartnerCommissionBatch_paidAt_idx" ON "PartnerCommissionBatch"("paidAt");

-- CreateIndex
CREATE INDEX "PartnerCommissionBatch_createdById_idx" ON "PartnerCommissionBatch"("createdById");

-- AddForeignKey
ALTER TABLE "PartnerCommission" ADD CONSTRAINT "PartnerCommission_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "PartnerCommissionBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommissionBatch" ADD CONSTRAINT "PartnerCommissionBatch_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommissionBatch" ADD CONSTRAINT "PartnerCommissionBatch_paidById_fkey" FOREIGN KEY ("paidById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommissionBatch" ADD CONSTRAINT "PartnerCommissionBatch_canceledById_fkey" FOREIGN KEY ("canceledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommissionBatch" ADD CONSTRAINT "PartnerCommissionBatch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
