-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "acceptedByEmail" TEXT,
ADD COLUMN     "acceptedByName" TEXT;
