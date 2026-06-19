"use client";

import type { FormEvent } from "react";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  softDeleteProposal,
  type DeleteProposalState,
} from "@/lib/actions/proposals";

const confirmationText =
  "Tem certeza que deseja excluir esta proposta cancelada? Ela será ocultada das listas, mas o histórico será preservado.";

type Props = {
  proposalId: string;
  label?: string;
  redirectAfterDelete?: boolean;
};

export function DeleteProposalButton({
  proposalId,
  label = "Excluir",
  redirectAfterDelete = false,
}: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    DeleteProposalState,
    FormData
  >(softDeleteProposal.bind(null, proposalId), {
    success: false,
    error: null,
    message: null,
  });

  useEffect(() => {
    if (!state.success) return;

    if (redirectAfterDelete) {
      router.push("/dashboard/propostas");
    } else {
      router.refresh();
    }
  }, [redirectAfterDelete, router, state.success]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(confirmationText)) {
      event.preventDefault();
    }
  }

  return (
    <div className="space-y-1">
      <form action={formAction} onSubmit={handleSubmit}>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {isPending ? "Excluindo..." : label}
        </button>
      </form>
      {state.error ? (
        <p className="max-w-64 text-xs font-medium text-red-600">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
