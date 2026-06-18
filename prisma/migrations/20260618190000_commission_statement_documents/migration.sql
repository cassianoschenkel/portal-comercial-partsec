-- AlterEnum
ALTER TYPE "PartnerCommissionStatementStatus" ADD VALUE 'DOCUMENTS_RECEIVED';

-- CreateEnum
CREATE TYPE "CommissionStatementDocumentType" AS ENUM ('INVOICE', 'BANK_SLIP');

-- AlterTable
ALTER TABLE "PartnerCommissionStatement" ADD COLUMN "documentsReceivedAt" TIMESTAMP(3);
ALTER TABLE "PartnerCommissionStatement" ADD COLUMN "documentsReceivedById" TEXT;
ALTER TABLE "PartnerCommissionStatement" ADD COLUMN "financeEmailSentAt" TIMESTAMP(3);
ALTER TABLE "PartnerCommissionStatement" ADD COLUMN "financeEmailSentTo" TEXT;
ALTER TABLE "PartnerCommissionStatement" ADD COLUMN "documentsNotes" TEXT;

-- CreateTable
CREATE TABLE "PartnerCommissionStatementDocument" (
    "id" TEXT NOT NULL,
    "statementId" TEXT NOT NULL,
    "type" "CommissionStatementDocumentType" NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "storedFileName" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerCommissionStatementDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PartnerCommissionStatementDocument_statementId_type_key" ON "PartnerCommissionStatementDocument"("statementId", "type");

-- CreateIndex
CREATE INDEX "PartnerCommissionStatementDocument_statementId_idx" ON "PartnerCommissionStatementDocument"("statementId");

-- CreateIndex
CREATE INDEX "PartnerCommissionStatementDocument_type_idx" ON "PartnerCommissionStatementDocument"("type");

-- CreateIndex
CREATE INDEX "PartnerCommissionStatementDocument_uploadedById_idx" ON "PartnerCommissionStatementDocument"("uploadedById");

-- CreateIndex
CREATE INDEX "PartnerCommissionStatement_documentsReceivedAt_idx" ON "PartnerCommissionStatement"("documentsReceivedAt");

-- AddForeignKey
ALTER TABLE "PartnerCommissionStatement" ADD CONSTRAINT "PartnerCommissionStatement_documentsReceivedById_fkey" FOREIGN KEY ("documentsReceivedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommissionStatementDocument" ADD CONSTRAINT "PartnerCommissionStatementDocument_statementId_fkey" FOREIGN KEY ("statementId") REFERENCES "PartnerCommissionStatement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommissionStatementDocument" ADD CONSTRAINT "PartnerCommissionStatementDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
