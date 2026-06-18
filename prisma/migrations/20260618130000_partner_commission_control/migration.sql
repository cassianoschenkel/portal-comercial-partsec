-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'PAID', 'CANCELED');

-- CreateTable
CREATE TABLE "PartnerCommission" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "paidById" TEXT,
    "paymentReference" TEXT,
    "notes" TEXT,
    "canceledAt" TIMESTAMP(3),
    "canceledById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerCommission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PartnerCommission_proposalId_key" ON "PartnerCommission"("proposalId");

-- CreateIndex
CREATE INDEX "PartnerCommission_partnerId_idx" ON "PartnerCommission"("partnerId");

-- CreateIndex
CREATE INDEX "PartnerCommission_status_idx" ON "PartnerCommission"("status");

-- CreateIndex
CREATE INDEX "PartnerCommission_paidAt_idx" ON "PartnerCommission"("paidAt");

-- CreateIndex
CREATE INDEX "PartnerCommission_createdAt_idx" ON "PartnerCommission"("createdAt");

-- CreateIndex
CREATE INDEX "PartnerCommission_dueDate_idx" ON "PartnerCommission"("dueDate");

-- AddForeignKey
ALTER TABLE "PartnerCommission" ADD CONSTRAINT "PartnerCommission_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommission" ADD CONSTRAINT "PartnerCommission_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommission" ADD CONSTRAINT "PartnerCommission_paidById_fkey" FOREIGN KEY ("paidById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommission" ADD CONSTRAINT "PartnerCommission_canceledById_fkey" FOREIGN KEY ("canceledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
