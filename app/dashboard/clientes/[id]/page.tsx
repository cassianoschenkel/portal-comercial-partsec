import { notFound } from "next/navigation";

import { CustomerForm } from "@/components/customers/customer-form";
import { updateCustomer } from "@/lib/actions/customers";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCustomerPage({ params }: Props) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
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

      <CustomerForm
        action={updateCustomer.bind(null, customer.id)}
        initialData={customer}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}
