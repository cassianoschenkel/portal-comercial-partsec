"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  statementId: string;
};

export function ResendFinanceEmailButton({ statementId }: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    const confirmed = window.confirm("Reenviar a notificação ao financeiro?");
    if (!confirmed) return;

    setIsPending(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/financeiro/comissoes/relatorios/${statementId}/reenviar-financeiro`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        }
      );
      const data = (await response.json().catch(() => null)) as {
        success?: boolean;
        error?: string;
        message?: string;
      } | null;

      if (!response.ok || !data?.success) {
        setError(data?.error || "Falha ao reenviar e-mail ao financeiro.");
        return;
      }

      setMessage(data.message || "E-mail reenviado ao financeiro.");
      router.refresh();
    } catch {
      setError("Falha ao reenviar e-mail ao financeiro.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={isPending}
        onClick={handleClick}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        {isPending ? "Reenviando..." : "Reenviar e-mail ao financeiro"}
      </button>

      {error ? (
        <p className="max-w-64 text-xs font-medium text-red-600">{error}</p>
      ) : null}

      {message ? (
        <p className="max-w-64 text-xs font-medium text-emerald-700">
          {message}
        </p>
      ) : null}
    </div>
  );
}
