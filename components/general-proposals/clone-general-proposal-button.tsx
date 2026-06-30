"use client";

import { useTransition } from "react";

import { cloneGeneralProposal } from "@/lib/actions/general-proposals";

type Props = {
  proposalId: string;
};

export function CloneGeneralProposalButton({ proposalId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleClone() {
    const confirmed = window.confirm(
      "Deseja criar uma nova proposta em rascunho com base nesta proposta?"
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      await cloneGeneralProposal(proposalId);
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
