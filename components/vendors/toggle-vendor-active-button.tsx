"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  toggleVendorActive,
  type VendorActionState,
} from "@/lib/actions/vendors";

export function ToggleVendorActiveButton({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    VendorActionState,
    FormData
  >(toggleVendorActive.bind(null, id), {
    success: false,
    error: null,
    message: null,
  });

  useEffect(() => {
    if (state.success) router.refresh();
  }, [router, state.success]);

  return (
    <form action={formAction} className="space-y-1">
      <button
        type="submit"
        disabled={isPending}
        className={`rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-50 ${
          isActive
            ? "border-amber-200 text-amber-700 hover:bg-amber-50"
            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        }`}
      >
        {isPending ? "Alterando..." : isActive ? "Inativar" : "Ativar"}
      </button>
      {state.error ? (
        <p className="max-w-48 text-xs font-medium text-red-600">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
