-- Idempotent migration because 20260619123545_proposal_soft_delete was created empty
-- and some environments may already have these columns added manually.

ALTER TABLE "Proposal"
ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "Proposal"
ADD COLUMN IF NOT EXISTS "deletedById" TEXT;

CREATE INDEX IF NOT EXISTS "Proposal_deletedAt_idx"
ON "Proposal"("deletedAt");

CREATE INDEX IF NOT EXISTS "Proposal_deletedById_idx"
ON "Proposal"("deletedById");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Proposal_deletedById_fkey'
  ) THEN
    ALTER TABLE "Proposal"
    ADD CONSTRAINT "Proposal_deletedById_fkey"
    FOREIGN KEY ("deletedById")
    REFERENCES "User"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
  END IF;
END $$;
