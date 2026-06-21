"use client";

import { GeneralProposalStatus } from "@prisma/client";
import { useActionState, useEffect, useRef } from "react";

import {
  type GeneralProposalActionState,
  updateGeneralProposalStatus,
} from "@/lib/actions/general-proposals";
import {
  generalProposalStatusLabels,
  getGeneralProposalStatusClasses,
} from "@/lib/general-proposals/presentation";

const initialState: GeneralProposalActionState = {
  success: false,
  error: null,
  message: null,
};

const statuses = Object.values(GeneralProposalStatus);

export function GeneralProposalStatusCard({
  proposalId,
  currentStatus,
}: {
  proposalId: string;
  currentStatus: GeneralProposalStatus;
}) {
  const [state, formAction, isPending] = useActionState(
    updateGeneralProposalStatus,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Status da proposta</h2>
          <p className="mt-1 text-sm text-slate-600">Registre a evolução comercial da proposta.</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getGeneralProposalStatusClasses(currentStatus)}`}>
          {generalProposalStatusLabels[currentStatus]}
        </span>
      </div>

      <form ref={formRef} action={formAction} className="mt-5 grid gap-4 md:grid-cols-[minmax(220px,1fr)_2fr_auto] md:items-end">
        <input type="hidden" name="proposalId" value={proposalId} />
        <label className="block text-sm font-medium text-slate-700">
          Novo status
          <select
            name="toStatus"
            required
            defaultValue=""
            disabled={isPending}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
          >
            <option value="" disabled>Selecione</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {generalProposalStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Observação (opcional)
          <textarea
            name="notes"
            rows={2}
            maxLength={5000}
            disabled={isPending}
            className="mt-1 block w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
            placeholder="Contexto da alteração"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Atualizando..." : "Atualizar status"}
        </button>
      </form>

      {state.error ? <p className="mt-4 text-sm text-red-600" role="alert">{state.error}</p> : null}
      {state.message ? <p className="mt-4 text-sm text-emerald-700" role="status">{state.message}</p> : null}
    </section>
  );
}
