import { UserRole } from "@prisma/client";

import { InvitationActions } from "@/components/partners/invitation-actions";

type InvitationRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  expiresAt: Date;
  acceptedAt: Date | null;
  canceledAt: Date | null;
  createdAt: Date;
  createdBy: {
    name: string;
    email: string;
  } | null;
};

type InvitationActionState = {
  success: boolean;
  error: string | null;
  message?: string | null;
  inviteUrl?: string | null;
};

type InvitationAction = (
  state: InvitationActionState,
  formData: FormData
) => Promise<InvitationActionState>;

type Props = {
  invitations: InvitationRow[];
  getCancelAction: (invitationId: string) => InvitationAction;
  getResendAction: (invitationId: string) => InvitationAction;
};

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Admin global",
  PARTNER: "Parceiro legado",
  PARTNER_ADMIN: "Administrador",
  PARTNER_SELLER: "Vendedor",
  PARTNER_VIEWER: "Visualizador",
};

function getInvitationStatus(invitation: InvitationRow) {
  if (invitation.canceledAt) {
    return {
      label: "Cancelado",
      classes: "bg-slate-100 text-slate-600",
      canCancel: false,
      canResend: false,
    };
  }

  if (invitation.acceptedAt) {
    return {
      label: "Aceito",
      classes: "bg-emerald-100 text-emerald-700",
      canCancel: false,
      canResend: false,
    };
  }

  if (invitation.expiresAt <= new Date()) {
    return {
      label: "Expirado",
      classes: "bg-amber-100 text-amber-700",
      canCancel: true,
      canResend: true,
    };
  }

  return {
    label: "Pendente",
    classes: "bg-blue-100 text-blue-700",
    canCancel: true,
    canResend: true,
  };
}

export function InvitationsTable({
  invitations,
  getCancelAction,
  getResendAction,
}: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Nome
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              E-mail
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Perfil
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Criado em
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Expira em
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Criado por
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ações
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {invitations.map((invitation) => {
            const status = getInvitationStatus(invitation);

            return (
              <tr key={invitation.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {invitation.name}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {invitation.email}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {roleLabels[invitation.role]}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.classes}`}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {invitation.createdAt.toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {invitation.expiresAt.toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {invitation.createdBy
                    ? invitation.createdBy.name || invitation.createdBy.email
                    : "-"}
                </td>
                <td className="px-4 py-3">
                  <InvitationActions
                    canCancel={status.canCancel}
                    canResend={status.canResend}
                    cancelAction={getCancelAction(invitation.id)}
                    resendAction={getResendAction(invitation.id)}
                  />
                </td>
              </tr>
            );
          })}

          {invitations.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="px-4 py-8 text-center text-sm text-slate-500"
              >
                Nenhum convite encontrado.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
