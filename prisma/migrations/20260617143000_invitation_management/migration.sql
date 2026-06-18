-- AlterTable
ALTER TABLE "UserInvitation" ADD COLUMN "canceledAt" TIMESTAMP(3);
ALTER TABLE "UserInvitation" ADD COLUMN "canceledById" TEXT;

-- CreateIndex
CREATE INDEX "UserInvitation_canceledAt_idx" ON "UserInvitation"("canceledAt");

-- AddForeignKey
ALTER TABLE "UserInvitation" ADD CONSTRAINT "UserInvitation_canceledById_fkey" FOREIGN KEY ("canceledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
