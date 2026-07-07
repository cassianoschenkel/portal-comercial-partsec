-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('DRAFT', 'SENT', 'IN_PROGRESS', 'SUBMITTED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('POC', 'IMPLEMENTATION', 'COMMERCIAL_SCOPING', 'RENEWAL', 'OTHER');

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "partnerId" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "AssessmentType" NOT NULL DEFAULT 'POC',
    "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
    "tokenHash" TEXT,
    "tokenNonce" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "firstAccessedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "submittedByName" TEXT,
    "submittedByEmail" TEXT,
    "submittedByPhone" TEXT,
    "answers" JSONB,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_tokenHash_key" ON "Assessment"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_tokenNonce_key" ON "Assessment"("tokenNonce");

-- CreateIndex
CREATE INDEX "Assessment_customerId_idx" ON "Assessment"("customerId");

-- CreateIndex
CREATE INDEX "Assessment_partnerId_idx" ON "Assessment"("partnerId");

-- CreateIndex
CREATE INDEX "Assessment_createdByUserId_idx" ON "Assessment"("createdByUserId");

-- CreateIndex
CREATE INDEX "Assessment_status_idx" ON "Assessment"("status");

-- CreateIndex
CREATE INDEX "Assessment_type_idx" ON "Assessment"("type");

-- CreateIndex
CREATE INDEX "Assessment_tokenHash_idx" ON "Assessment"("tokenHash");

-- CreateIndex
CREATE INDEX "Assessment_tokenExpiresAt_idx" ON "Assessment"("tokenExpiresAt");

-- CreateIndex
CREATE INDEX "Assessment_submittedAt_idx" ON "Assessment"("submittedAt");

-- CreateIndex
CREATE INDEX "Assessment_createdAt_idx" ON "Assessment"("createdAt");

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
