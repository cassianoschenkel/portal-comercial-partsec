import Link from "next/link";
import { notFound } from "next/navigation";

import { PartnerUsersTable } from "@/components/partners/partner-users-table";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export default async function PartnerUsersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const partner = await prisma.partner.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      companyName: true,
    },
  });

  if (!partner) {
    notFound();
  }

  const users = await prisma.user.findMany({
    where: { partnerId: partner.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            Equipe do parceiro
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Usuários vinculados a {partner.companyName || partner.name}.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/dashboard/parceiros/${partner.id}/editar`}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Voltar
          </Link>
          <Link
            href={`/dashboard/parceiros/${partner.id}/usuarios/novo`}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Novo usuário
          </Link>
        </div>
      </div>

      <PartnerUsersTable partnerId={partner.id} users={users} />
    </div>
  );
}
