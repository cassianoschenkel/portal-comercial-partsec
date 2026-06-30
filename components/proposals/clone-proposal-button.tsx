"use client";

import { useTransition } from "react";

import { cloneProposal } from "@/lib/actions/proposals";

type Props = {
  proposalId: string;
};

export function CloneProposalButton({ proposalId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleClone() {
    const confirmed = window.confirm(
      "Deseja criar uma nova proposta em rascunho com base nesta proposta?"
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      await cloneProposal(proposalId);
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClone}
      className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? "Clonando..." : "Clonar proposta"}
    </button>
  );
}
