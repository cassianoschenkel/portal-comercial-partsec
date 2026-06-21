import type { Prisma } from "@prisma/client";

export async function generateGeneralProposalNumber(
  tx: Prisma.TransactionClient,
  year = new Date().getFullYear()
) {
  const prefix = `GP-${year}-`;

  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`general-proposal-number:${year}`}))`;

  const proposals = await tx.generalProposal.findMany({
    where: { proposalNumber: { startsWith: prefix } },
    select: { proposalNumber: true },
  });

  const largestSequence = proposals.reduce((largest, proposal) => {
    const match = proposal.proposalNumber.match(
      new RegExp(`^GP-${year}-(\\d+)$`)
    );
    const sequence = match ? Number(match[1]) : 0;
    return Number.isSafeInteger(sequence) && sequence > largest
      ? sequence
      : largest;
  }, 0);

  return `${prefix}${String(largestSequence + 1).padStart(6, "0")}`;
}
