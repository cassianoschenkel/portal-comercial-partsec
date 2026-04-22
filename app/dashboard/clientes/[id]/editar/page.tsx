import { notFound } from "next/navigation";

import { CustomerForm } from "@/components/customers/customer-form";
import { updateCustomer } from "@/lib/actions/customers";
import { prisma } from "@/lib/prisma";

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
	const customer = await prisma.customer.findFirst({
		where: {
		id,
		...(session.user.role === UserRole.ADMIN
		? {}
		: { partnerId: session.user.id }),
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
