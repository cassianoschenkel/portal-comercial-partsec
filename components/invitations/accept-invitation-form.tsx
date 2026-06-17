"use client";

import { useActionState } from "react";

import { acceptInvitation } from "@/lib/actions/invitations";

type Props = {
  token: string;
};

export function AcceptInvitationForm({ token }: Props) {
  const [state, formAction, isPending] = useActionState(
    acceptInvitation.bind(null, token),
    {
      success: false,
      error: null,
    }
  );

  return (
    <form action={formAction} className="mt-6 space-y-5">
      {state.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700"
        >
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      <div>
        <label
          htmlFor="passwordConfirmation"
          className="block text-sm font-medium text-slate-700"
        >
          Confirmar senha
        </label>
        <input
          id="passwordConfirmation"
          name="passwordConfirmation"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {isPending ? "Salvando..." : "Definir senha e acessar"}
      </button>
    </form>
  );
}
