-- CreateEnum
CREATE TYPE "GeneralProposalStatus" AS ENUM ('DRAFT', 'INTERNAL_REVIEW', 'APPROVED', 'SENT', 'NEGOTIATION', 'WON', 'LOST', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "GeneralProposalType" AS ENUM ('NEW_SALE', 'RENEWAL', 'UPGRADE', 'REPLACEMENT', 'EXPANSION', 'IMPLEMENTATION', 'PROJECT', 'OTHER');

-- CreateEnum
CREATE TYPE "GeneralPricingMode" AS ENUM ('MARGIN', 'MARKUP', 'MANUAL');

-- CreateEnum
CREATE TYPE "GeneralServicePricingMode" AS ENUM ('HOURLY', 'FIXED', 'MANUAL');

-- CreateEnum
CREATE TYPE "GeneralProposalServiceType" AS ENUM ('IMPLEMENTATION', 'MIGRATION', 'CONFIGURATION', 'TRAINING', 'CONSULTING', 'HEALTH_CHECK', 'SUPPORT_HOURS', 'PROJECT_MANAGEMENT', 'OTHER');

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "category" TEXT,
    "shortDescription" TEXT,
    "aboutText" TEXT,
    "internalNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneralProposal" (
    "id" TEXT NOT NULL,
    "proposalNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "status" "GeneralProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "proposalType" "GeneralProposalType" NOT NULL DEFAULT 'NEW_SALE',
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "licenseTermMonths" INTEGER,
    "validUntil" TIMESTAMP(3),
    "paymentTerms" TEXT,
    "executiveSummary" TEXT,
    "projectScope" TEXT,
    "commercialNotes" TEXT,
    "internalNotes" TEXT,
    "subtotalProducts" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "subtotalServices" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalSalePrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalDiscount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "finalPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grossProfit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grossMarginPercent" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "markupPercent" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneralProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneralProposalItem" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "vendorId" TEXT,
    "sku" TEXT,
    "productName" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "quantity" DECIMAL(12,2) NOT NULL DEFAULT 1,
    "licenseTermMonths" INTEGER,
    "costUnitPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "listUnitPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "pricingMode" "GeneralPricingMode" NOT NULL DEFAULT 'MARGIN',
    "marginPercent" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "markupPercent" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "discountPercent" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "saleUnitPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalSalePrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalDiscount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "finalItemPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grossProfit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grossMarginPercent" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "isVisibleToClient" BOOLEAN NOT NULL DEFAULT true,
    "internalNotes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneralProposalItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneralProposalService" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "description" TEXT,
    "serviceType" "GeneralProposalServiceType" NOT NULL DEFAULT 'OTHER',
    "pricingMode" "GeneralServicePricingMode" NOT NULL DEFAULT 'FIXED',
    "estimatedHours" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "internalHourlyCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "saleHourlyRate" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "fixedCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "fixedSalePrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalSalePrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grossProfit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grossMarginPercent" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "isVisibleToClient" BOOLEAN NOT NULL DEFAULT true,
    "internalNotes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneralProposalService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_slug_key" ON "Vendor"("slug");
CREATE INDEX "Vendor_name_idx" ON "Vendor"("name");
CREATE INDEX "Vendor_isActive_idx" ON "Vendor"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "GeneralProposal_proposalNumber_key" ON "GeneralProposal"("proposalNumber");
CREATE INDEX "GeneralProposal_customerId_idx" ON "GeneralProposal"("customerId");
CREATE INDEX "GeneralProposal_vendorId_idx" ON "GeneralProposal"("vendorId");
CREATE INDEX "GeneralProposal_createdByUserId_idx" ON "GeneralProposal"("createdByUserId");
CREATE INDEX "GeneralProposal_status_idx" ON "GeneralProposal"("status");
CREATE INDEX "GeneralProposal_proposalType_idx" ON "GeneralProposal"("proposalType");
CREATE INDEX "GeneralProposal_deletedAt_idx" ON "GeneralProposal"("deletedAt");
CREATE INDEX "GeneralProposal_deletedById_idx" ON "GeneralProposal"("deletedById");
CREATE INDEX "GeneralProposal_createdAt_idx" ON "GeneralProposal"("createdAt");

-- CreateIndex
CREATE INDEX "GeneralProposalItem_proposalId_idx" ON "GeneralProposalItem"("proposalId");
CREATE INDEX "GeneralProposalItem_vendorId_idx" ON "GeneralProposalItem"("vendorId");
CREATE INDEX "GeneralProposalItem_sku_idx" ON "GeneralProposalItem"("sku");
CREATE INDEX "GeneralProposalItem_productName_idx" ON "GeneralProposalItem"("productName");
CREATE INDEX "GeneralProposalItem_sortOrder_idx" ON "GeneralProposalItem"("sortOrder");

-- CreateIndex
CREATE INDEX "GeneralProposalService_proposalId_idx" ON "GeneralProposalService"("proposalId");
CREATE INDEX "GeneralProposalService_serviceType_idx" ON "GeneralProposalService"("serviceType");
CREATE INDEX "GeneralProposalService_sortOrder_idx" ON "GeneralProposalService"("sortOrder");

-- AddForeignKey
ALTER TABLE "GeneralProposal" ADD CONSTRAINT "GeneralProposal_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GeneralProposal" ADD CONSTRAINT "GeneralProposal_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GeneralProposal" ADD CONSTRAINT "GeneralProposal_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GeneralProposal" ADD CONSTRAINT "GeneralProposal_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GeneralProposalItem" ADD CONSTRAINT "GeneralProposalItem_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "GeneralProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GeneralProposalItem" ADD CONSTRAINT "GeneralProposalItem_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GeneralProposalService" ADD CONSTRAINT "GeneralProposalService_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "GeneralProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
