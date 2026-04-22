import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import { notFound, redirect } from "next/navigation";

import { PartnerForm } from "@/components/partners/partner-form";
import { updateCustomer } from "@/lib/actions/customers";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  const { id } = await params;

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

      {/* aqui use o form de cliente, não o de partner */}
      {/* exemplo:
      <CustomerForm
        action={updateCustomer.bind(null, customer.id)}
        initialData={customer}
        submitLabel="Salvar alterações"
      />
      */}
    </div>
  );
}
