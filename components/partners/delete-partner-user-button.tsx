"use client";

import type { FormEvent } from "react";
import { useActionState } from "react";

type DeleteUserState = {
  success: boolean;
  error: string | null;
  message?: string | null;
};

type Props = {
  action: (
    state: DeleteUserState,
    formData: FormData
  ) => Promise<DeleteUserState>;
};

export function DeletePartnerUserButton({ action }: Props) {
  const [state, formAction, isPending] = useActionState(action, {
    success: false,
    error: null,
    message: null,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este usuário? O acesso será removido, mas o histórico será preservado."
    );

    if (!confirmed) {
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
          {isPending ? "Excluindo..." : "Excluir"}
        </button>
      </form>

      {state.error ? (
        <p className="max-w-48 text-right text-xs font-medium text-red-600">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
