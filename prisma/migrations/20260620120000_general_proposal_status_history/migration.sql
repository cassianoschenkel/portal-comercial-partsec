-- CreateTable
CREATE TABLE "GeneralProposalStatusHistory" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "fromStatus" "GeneralProposalStatus",
    "toStatus" "GeneralProposalStatus" NOT NULL,
    "changedByUserId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneralProposalStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GeneralProposalStatusHistory_proposalId_idx" ON "GeneralProposalStatusHistory"("proposalId");

-- CreateIndex
CREATE INDEX "GeneralProposalStatusHistory_changedByUserId_idx" ON "GeneralProposalStatusHistory"("changedByUserId");

-- CreateIndex
CREATE INDEX "GeneralProposalStatusHistory_toStatus_idx" ON "GeneralProposalStatusHistory"("toStatus");

-- CreateIndex
CREATE INDEX "GeneralProposalStatusHistory_createdAt_idx" ON "GeneralProposalStatusHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "GeneralProposalStatusHistory" ADD CONSTRAINT "GeneralProposalStatusHistory_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "GeneralProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneralProposalStatusHistory" ADD CONSTRAINT "GeneralProposalStatusHistory_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
