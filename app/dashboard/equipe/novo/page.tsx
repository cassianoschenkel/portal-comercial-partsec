import { UserRole } from "@prisma/client";
import { notFound } from "next/navigation";

import { PartnerUserForm } from "@/components/partners/partner-user-form";
import { createMyTeamUser } from "@/lib/actions/my-team";
import {
  getRequiredSession,
  requireCanManagePartnerTeam,
} from "@/lib/authz";

const roleOptions = [
  { value: UserRole.PARTNER_SELLER, label: "Vendedor" },
  { value: UserRole.PARTNER_VIEWER, label: "Visualizador" },
];

export default async function NewMyTeamUserPage() {
  const session = await getRequiredSession();
  requireCanManagePartnerTeam(session);

  if (!session.user.partnerId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">
          Novo usuário da equipe
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Crie um acesso operacional para a equipe do seu parceiro.
        </p>
      </div>

      <PartnerUserForm
        action={createMyTeamUser}
        backHref="/dashboard/equipe"
        roleOptions={roleOptions}
        submitLabel="Salvar usuário"
      />
    </div>
  );
}
