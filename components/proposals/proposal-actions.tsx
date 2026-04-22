"use client";

import { ProposalStatus } from "@prisma/client";
import { useTransition } from "react";

import { updateProposalStatus } from "@/lib/actions/proposals";

type Props = {
  proposalId: string;
  currentStatus: ProposalStatus;
};

export function ProposalActions({ proposalId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleChangeStatus(status: ProposalStatus) {
    startTransition(async () => {
      await updateProposalStatus(proposalId, status);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        disabled={isPending}
        onClick={() => handleChangeStatus("SENT")}
        className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        Marcar como enviada
      </button>

      <button
        disabled={isPending}
        onClick={() => handleChangeStatus("ACCEPTED")}
        className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        Aceita
      </button>

      <button
        disabled={isPending}
        onClick={() => handleChangeStatus("REJECTED")}
        className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        Rejeitada
      </button>

      <button
        disabled={isPending}
        onClick={() => handleChangeStatus("CANCELLED")}
        className="rounded-md bg-slate-500 px-3 py-2 text-sm font-medium text-white hover:bg-slate-600 disabled:opacity-50"
      >
        Cancelar
      </button>
    </div>
  );
}
