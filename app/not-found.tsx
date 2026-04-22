import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          404
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          Registro nao encontrado
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          O item solicitado nao existe ou foi removido.
        </p>
        <Link
          className="mt-6 inline-flex rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          href="/"
        >
          Voltar ao dashboard
        </Link>
      </section>
    </main>
  );
}
