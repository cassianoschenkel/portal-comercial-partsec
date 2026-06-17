"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inviteAccepted = searchParams.get("convite") === "aceito";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
      //callbackUrl: searchParams.get("callbackUrl") ?? "/"
      callbackUrl: "/dashboard"
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      setError("E-mail ou senha invalidos.");
      return;
    }

    //router.push(result.url ?? "/");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          placeholder="admin@partsec.com.br"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="password">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          placeholder="admin123"
        />
      </div>

      {inviteAccepted ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          Convite aceito. Entre com sua nova senha.
        </p>
      ) : null}

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
