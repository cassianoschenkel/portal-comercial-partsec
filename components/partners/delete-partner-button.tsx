"use client";

import { useTransition } from "react";

import { deletePartner } from "@/lib/actions/partners";

type Props = {
  id: string;
};

export function DeletePartnerButton({ id }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      "Deseja realmente excluir este parceiro?"
    );

    if (!confirmed) return;

    startTransition(async () => {
      await deletePartner(id);
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {isPending ? "Excluindo..." : "Excluir"}
    </button>
  );
}