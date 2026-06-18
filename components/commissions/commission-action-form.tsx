"use client";

import type { FormEvent, ReactNode } from "react";
import { useActionState } from "react";

import type { CommissionActionState } from "@/lib/actions/commissions";

type CommissionAction = (
  state: CommissionActionState,
  formData: FormData
) => Promise<CommissionActionState>;

type Props = {
  action: CommissionAction;
  children?: ReactNode;
  confirmMessage?: string;
  submitLabel: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
};

const buttonClasses = {
  primary:
    "bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50",
  secondary:
    "border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50",
  danger:
    "border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50",
};

export function CommissionActionForm({
  action,
  children,
  confirmMessage,
  submitLabel,
  pendingLabel = "Processando...",
  variant = "secondary",
}: Props) {
  const [state, formAction, isPending] = useActionState(action, {
    success: false,
    error: null,
    message: null,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!confirmMessage) return;

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <form
      action={formAction}
      className="space-y-2"
      encType="multipart/form-data"
      onSubmit={handleSubmit}
    >
      {children}

      <button
        type="submit"
        disabled={isPending}
        className={`rounded-md px-3 py-2 text-sm font-medium ${buttonClasses[variant]}`}
      >
        {isPending ? pendingLabel : submitLabel}
      </button>

      {state.error ? (
        <p className="max-w-64 text-xs font-medium text-red-600">
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p className="max-w-64 text-xs font-medium text-emerald-700">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
