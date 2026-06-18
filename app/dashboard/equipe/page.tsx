import { UserRole } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import { InvitationsTable } from "@/components/partners/invitations-table";
import { PartnerUsersTable } from "@/components/partners/partner-users-table";
import {
  cancelMyTeamInvitation,
  resendMyTeamInvitation,
} from "@/lib/actions/my-team";
import {
  getRequiredSession,
  requireCanManagePartnerTeam,
} from "@/lib/authz";
import { prisma } from "@/lib/prisma";

const editableTeamRoles = [UserRole.PARTNER_SELLER, UserRole.PARTNER_VIEWER];

export default async function MyTeamPage() {
  const session = await getRequiredSession();
  requireCanManagePartnerTeam(session);

  if (!session.user.partnerId) {
    notFound();
  }

  const users = await prisma.user.findMany({
    where: { partnerId: session.user.partnerId },
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

  const invitations = await prisma.userInvitation.findMany({
    where: { partnerId: session.user.partnerId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      expiresAt: true,
      acceptedAt: true,
      canceledAt: true,
      createdAt: true,
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Equipe</h1>
          <p className="mt-1 text-sm text-slate-600">
            Gerencie os acessos da equipe do seu parceiro.
          </p>
        </div>

        <Link
          href="/dashboard/equipe/novo"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Novo usuário
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">
          Usuários ativos
        </h2>
        <PartnerUsersTable
          partnerId={session.user.partnerId}
          editBasePath="/dashboard/equipe"
          editableRoles={editableTeamRoles}
          users={users}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">
          Convites
        </h2>
        <InvitationsTable
          invitations={invitations}
          getCancelAction={(invitationId) =>
            cancelMyTeamInvitation.bind(null, invitationId)
          }
          getResendAction={(invitationId) =>
            resendMyTeamInvitation.bind(null, invitationId)
          }
        />
      </section>
    </div>
  );
}
