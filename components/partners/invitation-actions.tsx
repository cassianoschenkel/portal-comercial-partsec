"use client";

import { useActionState } from "react";

type InvitationActionState = {
  success: boolean;
  error: string | null;
  message?: string | null;
  inviteUrl?: string | null;
};

type InvitationAction = (
  state: InvitationActionState,
  formData: FormData
) => Promise<InvitationActionState>;

type Props = {
  canCancel: boolean;
  canResend: boolean;
  cancelAction: InvitationAction;
  resendAction: InvitationAction;
};

export function InvitationActions({
  canCancel,
  canResend,
  cancelAction,
  resendAction,
}: Props) {
  const [cancelState, cancelFormAction, isCanceling] = useActionState(
    cancelAction,
    {
      success: false,
      error: null,
      message: null,
      inviteUrl: null,
    }
  );
  const [resendState, resendFormAction, isResending] = useActionState(
    resendAction,
    {
      success: false,
      error: null,
      message: null,
      inviteUrl: null,
    }
  );

  return (
    <div className="space-y-2">
      <div className="flex justify-end gap-2">
        {canResend ? (
          <form action={resendFormAction}>
            <button
              type="submit"
              disabled={isResending}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {isResending ? "Reenviando..." : "Reenviar"}
            </button>
          </form>
        ) : null}

        {canCancel ? (
          <form action={cancelFormAction}>
            <button
              type="submit"
              disabled={isCanceling}
              className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {isCanceling ? "Cancelando..." : "Cancelar"}
            </button>
          </form>
        ) : null}
      </div>

      {cancelState.error || resendState.error ? (
        <p className="text-right text-xs font-medium text-red-600">
          {cancelState.error || resendState.error}
        </p>
      ) : null}

      {cancelState.message || resendState.message ? (
        <p className="text-right text-xs font-medium text-emerald-700">
          {cancelState.message || resendState.message}
        </p>
      ) : null}

      {resendState.inviteUrl ? (
        <input
          readOnly
          value={resendState.inviteUrl}
          onFocus={(event) => event.currentTarget.select()}
          className="w-full rounded-md border border-emerald-200 bg-white px-2 py-1 text-xs text-slate-900"
        />
      ) : null}
    </div>
  );
}
