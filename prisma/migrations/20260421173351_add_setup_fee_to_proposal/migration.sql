-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "partnerCommissionSetupValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "setupFee" DECIMAL(10,2) NOT NULL DEFAULT 0;
