-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedById" TEXT;

-- CreateIndex
CREATE INDEX "Proposal_deletedAt_idx" ON "Proposal"("deletedAt");

-- CreateIndex
CREATE INDEX "Proposal_deletedById_idx" ON "Proposal"("deletedById");

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
