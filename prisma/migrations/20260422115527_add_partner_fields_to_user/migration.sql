-- AlterTable
ALTER TABLE "User" ADD COLUMN     "commissionPercent" DECIMAL(5,2) NOT NULL DEFAULT 30,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" TEXT;
