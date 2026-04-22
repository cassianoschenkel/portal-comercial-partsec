-- DropForeignKey
ALTER TABLE "Proposal" DROP CONSTRAINT "Proposal_customerId_fkey";

-- DropIndex
DROP INDEX "Proposal_customerId_idx";

-- DropIndex
DROP INDEX "Proposal_partnerId_idx";

-- DropIndex
DROP INDEX "Proposal_status_idx";

-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "notes" TEXT,
ALTER COLUMN "discountPercent" DROP DEFAULT,
ALTER COLUMN "discountValue" DROP DEFAULT,
ALTER COLUMN "partnerCommissionPercent" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
