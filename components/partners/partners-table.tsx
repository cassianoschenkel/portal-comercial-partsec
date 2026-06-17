import Link from "next/link";

import { DeletePartnerButton } from "@/components/partners/delete-partner-button";

type PartnerRow = {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
  phone: string | null;
  commissionPercent: unknown;
  isActive: boolean;
  role: string;
};

type Props = {
  partners: PartnerRow[];
};

export function PartnersTable({ partners }: Props) {
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
              Empresa
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Comissão
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ações
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {partners.map((partner) => (
            <tr key={partner.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <div className="font-medium text-slate-900">{partner.name}</div>
                {partner.phone ? (
                  <div className="text-sm text-slate-500">{partner.phone}</div>
                ) : null}
              </td>

              <td className="px-4 py-3 text-sm text-slate-700">
                {partner.email}
              </td>

              <td className="px-4 py-3 text-sm text-slate-700">
                {partner.companyName || "—"}
              </td>

              <td className="px-4 py-3 text-sm text-slate-700">
                {Number(partner.commissionPercent)}%
              </td>

              <td className="px-4 py-3 text-sm">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    partner.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {partner.isActive ? "Ativo" : "Inativo"}
                </span>
              </td>

              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/dashboard/parceiros/${partner.id}/editar`}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Editar
                  </Link>

                  <Link
                    href={`/dashboard/parceiros/${partner.id}/usuarios`}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Equipe
                  </Link>

                  <DeletePartnerButton id={partner.id} />
                </div>
              </td>
            </tr>
          ))}

          {partners.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                Nenhum parceiro cadastrado.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
