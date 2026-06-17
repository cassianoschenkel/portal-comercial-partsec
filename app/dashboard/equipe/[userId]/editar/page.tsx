import { UserRole } from "@prisma/client";
import { notFound } from "next/navigation";

import { PartnerUserForm } from "@/components/partners/partner-user-form";
import { updateMyTeamUser } from "@/lib/actions/my-team";
import {
  getRequiredSession,
  requireCanManagePartnerTeam,
} from "@/lib/authz";
import { prisma } from "@/lib/prisma";

const editableTeamRoles = [UserRole.PARTNER_SELLER, UserRole.PARTNER_VIEWER];

const roleOptions = [
  { value: UserRole.PARTNER_SELLER, label: "Vendedor" },
  { value: UserRole.PARTNER_VIEWER, label: "Visualizador" },
];

export default async function EditMyTeamUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await getRequiredSession();
  requireCanManagePartnerTeam(session);

  if (!session.user.partnerId) {
    notFound();
  }

  const { userId } = await params;

  if (userId === session.user.id) {
    notFound();
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      partnerId: session.user.partnerId,
      role: { in: editableTeamRoles },
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
          Editar usuário da equipe
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Atualize o acesso de {user.name}.
        </p>
      </div>

      <PartnerUserForm
        action={updateMyTeamUser.bind(null, user.id)}
        backHref="/dashboard/equipe"
        initialData={user}
        roleOptions={roleOptions}
        submitLabel="Salvar alterações"
        isEdit
      />
    </div>
  );
}
