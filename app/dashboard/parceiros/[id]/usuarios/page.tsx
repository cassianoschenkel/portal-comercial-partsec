import { UserRole } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import { InvitationsTable } from "@/components/partners/invitations-table";
import { PartnerUsersTable } from "@/components/partners/partner-users-table";
import {
  cancelPartnerInvitation,
  deletePartnerUser,
  resendPartnerInvitation,
} from "@/lib/actions/partner-users";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export default async function PartnerUsersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdmin();

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
    where: { partnerId: partner.id, deletedAt: null },
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
    where: { partnerId: partner.id },
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

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">
          Usuários ativos
        </h2>
        <PartnerUsersTable
          partnerId={partner.id}
          deletableRoles={[
            UserRole.PARTNER,
            UserRole.PARTNER_ADMIN,
            UserRole.PARTNER_SELLER,
            UserRole.PARTNER_VIEWER,
          ]}
          getDeleteAction={(userId) =>
            deletePartnerUser.bind(null, partner.id, userId)
          }
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
            cancelPartnerInvitation.bind(null, partner.id, invitationId)
          }
          getResendAction={(invitationId) =>
            resendPartnerInvitation.bind(null, partner.id, invitationId)
          }
        />
      </section>
    </div>
  );
}
