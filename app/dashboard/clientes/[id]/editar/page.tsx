import { notFound } from "next/navigation";

import { CustomerForm } from "@/components/customers/customer-form";
import { updateCustomer } from "@/lib/actions/customers";
import {
  getEffectivePartnerId,
  getRequiredSession,
  isAdmin,
  requireCanUpdateCustomer,
} from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getRequiredSession();
  requireCanUpdateCustomer(session);

  const partnerId = getEffectivePartnerId(session);

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
      <h1 className="text-2xl font-semibold">Editar cliente</h1>

      <CustomerForm
        action={updateCustomer.bind(null, customer.id)}
        initialData={customer}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}
