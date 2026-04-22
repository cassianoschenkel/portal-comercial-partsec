import Link from "next/link";

import { DeleteCustomerButton } from "@/components/customers/delete-customer-button";

type CustomerRow = {
  id: string;
  companyName: string;
  tradeName: string | null;
  document: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: Date;
};

type Props = {
  customers: CustomerRow[];
};

export function CustomersTable({ customers }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Empresa
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Documento
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Contato
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              E-mail
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <div className="font-medium text-slate-900">{customer.companyName}</div>
                {customer.tradeName ? (
                  <div className="text-sm text-slate-500">{customer.tradeName}</div>
                ) : null}
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">{customer.document}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{customer.contactName}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{customer.contactEmail}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/dashboard/clientes/${customer.id}/editar`}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Editar
                  </Link>
                  <DeleteCustomerButton id={customer.id} />
                </div>
              </td>
            </tr>
          ))}
          {customers.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                Nenhum cliente cadastrado.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
