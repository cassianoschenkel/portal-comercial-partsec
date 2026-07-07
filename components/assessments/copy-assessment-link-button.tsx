"use client";

import { useEffect, useRef, useState } from "react";

import { copyTextToClipboard } from "@/lib/clipboard";

type Props = {
  publicUrl: string;
};

type CopyStatus = "idle" | "success" | "error";

export function CopyAssessmentLinkButton({ publicUrl }: Props) {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  async function handleCopy() {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }

    const link = publicUrl.startsWith("/")
      ? `${window.location.origin}${publicUrl}`
      : publicUrl;

    const copied = await copyTextToClipboard(link);

    if (copied) {
      setCopyStatus("success");
      resetTimeoutRef.current = setTimeout(() => setCopyStatus("idle"), 3000);
      return;
    }

    setCopyStatus("error");
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        {copyStatus === "success" ? "Link copiado!" : "Copiar link"}
      </button>
      <p
        aria-live="polite"
        className={`max-w-xs text-xs ${
          copyStatus === "error" ? "text-red-600" : "text-emerald-700"
        }`}
      >
        {copyStatus === "success"
          ? "Link copiado para a área de transferência."
          : null}
        {copyStatus === "error"
          ? "Não foi possível copiar automaticamente. Selecione e copie o link manualmente."
          : null}
      </p>
    </div>
  );
}
