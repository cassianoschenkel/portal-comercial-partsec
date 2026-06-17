import { notFound } from "next/navigation";

import { CustomerForm } from "@/components/customers/customer-form";
import { updateCustomer } from "@/lib/actions/customers";
import {
  canUpdateCustomer,
  getEffectivePartnerId,
  getRequiredSession,
  isAdmin,
} from "@/lib/authz";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCustomerPage({ params }: Props) {
  const session = await getRequiredSession();
  const partnerId = getEffectivePartnerId(session);
  const canUpdate = canUpdateCustomer(session);
  const { id } = await params;

  const customer = await prisma.customer.findFirst({
    where: {
      id,
      ...(isAdmin(session) ? {} : { partnerId: partnerId ?? "" }),
    },
  });

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Editar cliente</h1>
        <p className="mt-1 text-sm text-slate-600">
          Atualize os dados comerciais do cliente.
        </p>
      </div>

      {canUpdate ? (
        <CustomerForm
          action={updateCustomer.bind(null, customer.id)}
          initialData={customer}
          submitLabel="Salvar alterações"
        />
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-slate-500">Empresa</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {customer.companyName}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">
                Nome fantasia
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {customer.tradeName || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Documento</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {customer.document}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Contato</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {customer.contactName}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">E-mail</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {customer.contactEmail}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Telefone</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {customer.contactPhone || "-"}
              </dd>
            </div>
          </dl>

          {customer.notes ? (
            <div className="mt-6">
              <dt className="text-sm font-medium text-slate-500">
                Observações
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-900">
                {customer.notes}
              </dd>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
