-- CreateEnum
CREATE TYPE "PartnerCommissionStatementStatus" AS ENUM ('DRAFT', 'SENT', 'WAITING_DOCUMENTS', 'CANCELED');

-- AlterTable
ALTER TABLE "PartnerCommission" ADD COLUMN "statementId" TEXT;

-- CreateTable
CREATE TABLE "PartnerCommissionStatement" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "referenceMonth" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" "PartnerCommissionStatementStatus" NOT NULL DEFAULT 'DRAFT',
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "commissionCount" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3),
    "sentById" TEXT,
    "canceledAt" TIMESTAMP(3),
    "canceledById" TEXT,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerCommissionStatement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartnerCommission_statementId_idx" ON "PartnerCommission"("statementId");

-- CreateIndex
CREATE INDEX "PartnerCommissionStatement_partnerId_idx" ON "PartnerCommissionStatement"("partnerId");

-- CreateIndex
CREATE INDEX "PartnerCommissionStatement_status_idx" ON "PartnerCommissionStatement"("status");

-- CreateIndex
CREATE INDEX "PartnerCommissionStatement_referenceMonth_idx" ON "PartnerCommissionStatement"("referenceMonth");

-- CreateIndex
CREATE INDEX "PartnerCommissionStatement_periodStart_periodEnd_idx" ON "PartnerCommissionStatement"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "PartnerCommissionStatement_sentAt_idx" ON "PartnerCommissionStatement"("sentAt");

-- CreateIndex
CREATE INDEX "PartnerCommissionStatement_createdById_idx" ON "PartnerCommissionStatement"("createdById");

-- AddForeignKey
ALTER TABLE "PartnerCommission" ADD CONSTRAINT "PartnerCommission_statementId_fkey" FOREIGN KEY ("statementId") REFERENCES "PartnerCommissionStatement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommissionStatement" ADD CONSTRAINT "PartnerCommissionStatement_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommissionStatement" ADD CONSTRAINT "PartnerCommissionStatement_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommissionStatement" ADD CONSTRAINT "PartnerCommissionStatement_canceledById_fkey" FOREIGN KEY ("canceledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommissionStatement" ADD CONSTRAINT "PartnerCommissionStatement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
