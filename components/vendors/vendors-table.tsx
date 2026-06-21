import Link from "next/link";

import { ToggleVendorActiveButton } from "@/components/vendors/toggle-vendor-active-button";

type VendorRow = {
  id: string;
  name: string;
  category: string | null;
  websiteUrl: string | null;
  isActive: boolean;
  updatedAt: Date;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

export function VendorsTable({ vendors }: { vendors: VendorRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {[
              "Nome",
              "Categoria",
              "Website",
              "Status",
              "Atualizado em",
            ].map((label) => (
              <th
                key={label}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {label}
              </th>
            ))}
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {vendors.map((vendor) => (
            <tr key={vendor.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-sm font-medium text-slate-900">
                {vendor.name}
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">
                {vendor.category || "—"}
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">
                {vendor.websiteUrl ? (
                  <a
                    href={vendor.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 hover:underline"
                  >
                    Acessar
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    vendor.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {vendor.isActive ? "Ativo" : "Inativo"}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">
                {formatDate(vendor.updatedAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/dashboard/comercial/fabricantes/${vendor.id}/editar`}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Editar
                  </Link>
                  <ToggleVendorActiveButton
                    id={vendor.id}
                    isActive={vendor.isActive}
                  />
                </div>
              </td>
            </tr>
          ))}
          {vendors.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                Nenhum fabricante cadastrado.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
