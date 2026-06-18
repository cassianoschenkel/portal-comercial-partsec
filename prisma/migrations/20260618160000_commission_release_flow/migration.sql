-- AlterTable
ALTER TABLE "PartnerCommission" ADD COLUMN "clientFirstPaymentConfirmedAt" TIMESTAMP(3);
ALTER TABLE "PartnerCommission" ADD COLUMN "clientFirstPaymentConfirmedById" TEXT;
ALTER TABLE "PartnerCommission" ADD COLUMN "clientPaymentReference" TEXT;
ALTER TABLE "PartnerCommission" ADD COLUMN "releasedAt" TIMESTAMP(3);
ALTER TABLE "PartnerCommission" ADD COLUMN "releasedById" TEXT;
ALTER TABLE "PartnerCommission" ADD COLUMN "releaseNotes" TEXT;

-- CreateIndex
CREATE INDEX "PartnerCommission_releasedAt_idx" ON "PartnerCommission"("releasedAt");

-- CreateIndex
CREATE INDEX "PartnerCommission_clientFirstPaymentConfirmedAt_idx" ON "PartnerCommission"("clientFirstPaymentConfirmedAt");

-- AddForeignKey
ALTER TABLE "PartnerCommission" ADD CONSTRAINT "PartnerCommission_clientFirstPaymentConfirmedById_fkey" FOREIGN KEY ("clientFirstPaymentConfirmedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommission" ADD CONSTRAINT "PartnerCommission_releasedById_fkey" FOREIGN KEY ("releasedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
