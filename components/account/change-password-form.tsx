"use client";

import { useActionState } from "react";

import {
  changeOwnPassword,
  type ChangePasswordState,
} from "@/lib/actions/account";

const initialState: ChangePasswordState = {
  success: false,
  error: null,
  message: null,
};

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(
    changeOwnPassword,
    initialState
  );

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-950">
          Alterar senha
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Use ao menos 8 caracteres, incluindo uma letra e um número.
        </p>
      </div>

      {state.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </div>
      ) : null}

      {state.success && state.message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {state.message}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="currentPassword"
          className="block text-sm font-medium text-slate-700"
        >
          Senha atual
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          disabled={isPending}
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100"
        />
      </div>

      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-slate-700"
        >
          Nova senha
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          disabled={isPending}
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100"
        />
      </div>

      <div>
        <label
          htmlFor="passwordConfirmation"
          className="block text-sm font-medium text-slate-700"
        >
          Confirmar nova senha
        </label>
        <input
          id="passwordConfirmation"
          name="passwordConfirmation"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          disabled={isPending}
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Alterando..." : "Alterar senha"}
        </button>
      </div>
    </form>
  );
}
