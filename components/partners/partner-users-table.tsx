import { UserRole } from "@prisma/client";
import Link from "next/link";

import { DeletePartnerUserButton } from "@/components/partners/delete-partner-user-button";

type PartnerUserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
};

type Props = {
  partnerId: string;
  editBasePath?: string;
  editableRoles?: UserRole[];
  deletableRoles?: UserRole[];
  getDeleteAction?: (userId: string) => (
    state: {
      success: boolean;
      error: string | null;
      message?: string | null;
    },
    formData: FormData
  ) => Promise<{
    success: boolean;
    error: string | null;
    message?: string | null;
  }>;
  users: PartnerUserRow[];
};

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Admin global",
  PARTNER: "Parceiro legado",
  PARTNER_ADMIN: "Administrador",
  PARTNER_SELLER: "Vendedor",
  PARTNER_VIEWER: "Visualizador",
};

const defaultEditableRoles: UserRole[] = [
  UserRole.PARTNER_ADMIN,
  UserRole.PARTNER_SELLER,
  UserRole.PARTNER_VIEWER,
];

export function PartnerUsersTable({
  partnerId,
  editBasePath = `/dashboard/parceiros/${partnerId}/usuarios`,
  editableRoles = defaultEditableRoles,
  deletableRoles = [],
  getDeleteAction,
  users,
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
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ações
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-900">
                {user.name}
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">
                {user.email}
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">
                {roleLabels[user.role]}
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    user.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {user.isActive ? "Ativo" : "Inativo"}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">
                {user.createdAt.toLocaleDateString("pt-BR")}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  {editableRoles.includes(user.role) ? (
                    <Link
                      href={`${editBasePath}/${user.id}/editar`}
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Editar
                    </Link>
                  ) : (
                    <span className="text-sm text-slate-400">
                      Editar em parceiro
                    </span>
                  )}
                  {getDeleteAction && deletableRoles.includes(user.role) ? (
                    <DeletePartnerUserButton
                      action={getDeleteAction(user.id)}
                    />
                  ) : null}
                </div>
              </td>
            </tr>
          ))}

          {users.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-sm text-slate-500"
              >
                Nenhum usuário vinculado a este parceiro.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
