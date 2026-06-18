import { UserRole } from "@prisma/client";
import { notFound } from "next/navigation";

import { PartnerUserForm } from "@/components/partners/partner-user-form";
import { updatePartnerUser } from "@/lib/actions/partner-users";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

const editablePartnerUserRoles = [
  UserRole.PARTNER_ADMIN,
  UserRole.PARTNER_SELLER,
  UserRole.PARTNER_VIEWER,
];

export default async function EditPartnerUserPage({
  params,
}: {
  params: Promise<{ id: string; userId: string }>;
}) {
  await requireAdmin();

  const { id, userId } = await params;

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

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      partnerId: partner.id,
      role: { in: editablePartnerUserRoles },
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">
          Editar usuário do parceiro
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Atualize o acesso de {user.name} em{" "}
          {partner.companyName || partner.name}.
        </p>
      </div>

      <PartnerUserForm
        action={updatePartnerUser.bind(null, partner.id, user.id)}
        backHref={`/dashboard/parceiros/${partner.id}/usuarios`}
        initialData={user}
        submitLabel="Salvar alterações"
        isEdit
      />
    </div>
  );
}
