"use client";

import { useState } from "react";

type Props = {
  code: string;
};

export function CopyPublicLinkButton({ code }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const publicUrl = `${window.location.origin}/proposta/${code}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(publicUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = publicUrl;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Erro ao copiar link:", error);
      alert("Não foi possível copiar o link automaticamente.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      {copied ? "Link copiado!" : "Copiar link público"}
    </button>
  );
}
