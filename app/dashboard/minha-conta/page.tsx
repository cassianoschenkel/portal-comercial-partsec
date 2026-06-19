import { redirect } from "next/navigation";

import { ChangePasswordForm } from "@/components/account/change-password-form";
import { getRequiredSession } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

const roleLabels = {
  ADMIN: "Administrador Partsec",
  PARTNER: "Parceiro",
  PARTNER_ADMIN: "Administrador do parceiro",
  PARTNER_SELLER: "Vendedor do parceiro",
  PARTNER_VIEWER: "Visualizador do parceiro",
};

export default async function MyAccountPage() {
  const session = await getRequiredSession();
  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
      isActive: true,
      deletedAt: null,
    },
    select: {
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Minha conta</h1>
        <p className="mt-1 text-sm text-slate-600">
          Consulte seus dados e gerencie a segurança da sua conta.
        </p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Dados da conta</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Nome
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {user.name}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              E-mail
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {user.email}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Perfil
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {roleLabels[user.role]}
            </dd>
          </div>
        </dl>
      </section>

      <ChangePasswordForm />
    </div>
  );
}
