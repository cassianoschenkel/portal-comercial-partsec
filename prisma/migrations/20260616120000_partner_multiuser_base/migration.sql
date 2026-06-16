-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'PARTNER_ADMIN';
ALTER TYPE "UserRole" ADD VALUE 'PARTNER_SELLER';
ALTER TYPE "UserRole" ADD VALUE 'PARTNER_VIEWER';

-- AlterTable
ALTER TABLE "User" ADD COLUMN "partnerId" TEXT;

-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN "createdById" TEXT;

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "companyName" TEXT NOT NULL,
    "tradeName" TEXT,
    "document" TEXT,
    "phone" TEXT,
    "defaultCommissionPercent" DECIMAL(5,2) NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- Backfill partners from legacy partner users and any currently referenced owner.
INSERT INTO "Partner" (
    "id",
    "name",
    "email",
    "companyName",
    "tradeName",
    "phone",
    "defaultCommissionPercent",
    "isActive",
    "createdAt",
    "updatedAt"
)
SELECT
    "User"."id",
    "User"."name",
    "User"."email",
    COALESCE("User"."companyName", "User"."name"),
    "User"."name",
    "User"."phone",
    "User"."commissionPercent",
    "User"."isActive",
    "User"."createdAt",
    "User"."updatedAt"
FROM "User"
WHERE
    "User"."role" = 'PARTNER'
    OR "User"."id" IN (SELECT "partnerId" FROM "Proposal")
    OR "User"."id" IN (
        SELECT "partnerId" FROM "Customer" WHERE "partnerId" IS NOT NULL
    );

-- Link legacy partner users to their new partner record.
UPDATE "User"
SET "partnerId" = "id"
WHERE "role" = 'PARTNER';

-- Preserve the creator for existing proposals.
UPDATE "Proposal"
SET "createdById" = "partnerId"
WHERE "createdById" IS NULL;

-- Drop old foreign keys to User before repointing partnerId to Partner.
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_partnerId_fkey";
ALTER TABLE "Proposal" DROP CONSTRAINT "Proposal_partnerId_fkey";

-- CreateIndex
CREATE INDEX "Partner_companyName_idx" ON "Partner"("companyName");
CREATE INDEX "User_partnerId_idx" ON "User"("partnerId");
CREATE INDEX "Proposal_partnerId_idx" ON "Proposal"("partnerId");
CREATE INDEX "Proposal_createdById_idx" ON "Proposal"("createdById");
CREATE INDEX "Proposal_status_idx" ON "Proposal"("status");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
