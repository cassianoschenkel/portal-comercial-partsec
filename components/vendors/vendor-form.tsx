"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { VendorActionState } from "@/lib/actions/vendors";

type VendorFormValues = {
  name?: string | null;
  slug?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  category?: string | null;
  shortDescription?: string | null;
  aboutText?: string | null;
  internalNotes?: string | null;
  isActive?: boolean | null;
};

type Props = {
  action: (
    state: VendorActionState,
    formData: FormData
  ) => Promise<VendorActionState>;
  initialData?: VendorFormValues;
  submitLabel: string;
};

export function VendorForm({ action, initialData, submitLabel }: Props) {
  const [state, formAction, isPending] = useActionState(action, {
    success: false,
    error: null,
    message: null,
  });

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
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

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Nome
          </label>
          <input
            id="name"
            name="name"
            defaultValue={initialData?.name ?? ""}
            required
            disabled={isPending}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-slate-700">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={initialData?.slug ?? ""}
            required
            disabled={isPending}
            placeholder="exemplo-fabricante"
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100"
          />
          <p className="mt-1 text-xs text-slate-500">
            Será normalizado em minúsculas, sem acentos e com hífens.
          </p>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700">
            Categoria
          </label>
          <input
            id="category"
            name="category"
            defaultValue={initialData?.category ?? ""}
            disabled={isPending}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100"
          />
        </div>

        <div>
          <label htmlFor="websiteUrl" className="block text-sm font-medium text-slate-700">
            Website
          </label>
          <input
            id="websiteUrl"
            name="websiteUrl"
            type="url"
            defaultValue={initialData?.websiteUrl ?? ""}
            disabled={isPending}
            placeholder="https://"
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100"
          />
        </div>

        <div>
          <label htmlFor="logoUrl" className="block text-sm font-medium text-slate-700">
            URL do logo
          </label>
          <input
            id="logoUrl"
            name="logoUrl"
            type="url"
            defaultValue={initialData?.logoUrl ?? ""}
            disabled={isPending}
            placeholder="https://"
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100"
          />
        </div>

        <div>
          <label htmlFor="shortDescription" className="block text-sm font-medium text-slate-700">
            Descrição curta
          </label>
          <input
            id="shortDescription"
            name="shortDescription"
            defaultValue={initialData?.shortDescription ?? ""}
            disabled={isPending}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100"
          />
        </div>
      </div>

      <div>
        <label htmlFor="aboutText" className="block text-sm font-medium text-slate-700">
          Sobre o fabricante
        </label>
        <textarea
          id="aboutText"
          name="aboutText"
          rows={6}
          defaultValue={initialData?.aboutText ?? ""}
          disabled={isPending}
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100"
        />
      </div>

      <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
        <label htmlFor="internalNotes" className="block text-sm font-semibold text-amber-900">
          Notas internas
        </label>
        <p className="mt-1 text-xs text-amber-700">
          Conteúdo interno da Partsec. Não será exibido ao cliente.
        </p>
        <textarea
          id="internalNotes"
          name="internalNotes"
          rows={6}
          defaultValue={initialData?.internalNotes ?? ""}
          disabled={isPending}
          className="mt-3 w-full rounded-md border border-amber-300 bg-white px-3 py-2 disabled:bg-slate-100"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          defaultChecked={initialData?.isActive ?? true}
          disabled={isPending}
          className="h-4 w-4 rounded border-slate-300"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
          Fabricante ativo
        </label>
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href="/dashboard/comercial/fabricantes"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Voltar
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {isPending ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
