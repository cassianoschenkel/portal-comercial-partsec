"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { deleteCustomer } from "@/lib/actions/customers";

type Props = {
  id: string;
};

export function DeleteCustomerButton({ id }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm("Deseja realmente excluir este cliente?");
    if (!confirmed) return;

    startTransition(async () => {
      await deleteCustomer(id);
      router.refresh();
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
