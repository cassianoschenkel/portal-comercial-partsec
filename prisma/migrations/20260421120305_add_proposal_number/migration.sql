/*
  Warnings:

  - A unique constraint covering the columns `[proposalNumber]` on the table `Proposal` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "proposalNumber" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_proposalNumber_key" ON "Proposal"("proposalNumber");
