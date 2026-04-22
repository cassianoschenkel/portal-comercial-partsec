import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { authOptions } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <section className="w-full max-w-md rounded-lg bg-white p-8 shadow-soft">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Partsec
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">
            Portal Comercial
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Acesse sua area comercial para gerenciar clientes e propostas.
          </p>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}
