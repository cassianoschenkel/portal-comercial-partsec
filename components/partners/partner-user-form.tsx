"use client";

import Link from "next/link";
import { useActionState } from "react";

type PartnerUserFormValues = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  isActive?: boolean | null;
};

type PartnerUserActionState = {
  success: boolean;
  error: string | null;
  message?: string | null;
  inviteUrl?: string | null;
};

type Props = {
  action: (
    state: PartnerUserActionState,
    formData: FormData
  ) => Promise<PartnerUserActionState>;
  backHref: string;
  initialData?: PartnerUserFormValues;
  isEdit?: boolean;
  roleOptions?: {
    value: string;
    label: string;
  }[];
  submitLabel: string;
};

const defaultRoleOptions = [
  { value: "PARTNER_ADMIN", label: "Administrador do parceiro" },
  { value: "PARTNER_SELLER", label: "Vendedor" },
  { value: "PARTNER_VIEWER", label: "Visualizador" },
];

export function PartnerUserForm({
  action,
  backHref,
  initialData,
  isEdit = false,
  roleOptions = defaultRoleOptions,
  submitLabel,
}: Props) {
  const [state, formAction, isPending] = useActionState(action, {
    success: false,
    error: null,
    message: null,
    inviteUrl: null,
  });

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-lg border border-slate-200 bg-white p-6"
    >
      {state.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </div>
      ) : null}

      {state.success && state.message ? (
        <div className="space-y-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p className="font-medium">{state.message}</p>
          {state.inviteUrl ? (
            <div>
              <p className="mb-1 text-emerald-700">
                Link de convite para teste:
              </p>
              <input
                readOnly
                value={state.inviteUrl}
                className="w-full rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900"
                onFocus={(event) => event.currentTarget.select()}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700"
          >
            Nome
          </label>
          <input
            id="name"
            name="name"
            defaultValue={initialData?.name ?? ""}
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700"
          >
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={initialData?.email ?? ""}
            disabled={isEdit}
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100 disabled:text-slate-500"
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-slate-700"
          >
            Perfil
          </label>
          <select
            id="role"
            name="role"
            defaultValue={initialData?.role ?? "PARTNER_SELLER"}
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {isEdit ? (
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700"
            >
              Nova senha (opcional)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          defaultChecked={Boolean(initialData?.isActive ?? true)}
          className="h-4 w-4 rounded border-slate-300"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
          Usuário ativo
        </label>
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href={backHref}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          {isPending ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
