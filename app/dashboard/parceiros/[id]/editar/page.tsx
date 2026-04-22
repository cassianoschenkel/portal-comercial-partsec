import { notFound } from "next/navigation";

import { PartnerForm } from "@/components/partners/partner-form";
import { updatePartner } from "@/lib/actions/partners";
import { prisma } from "@/lib/prisma";

export default async function EditPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const partner = await prisma.user.findFirst({
    where: {
      id,
      role: "PARTNER",
    },
  });

  if (!partner) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">
          Editar parceiro
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Atualize os dados comerciais do parceiro.
        </p>
      </div>

      <PartnerForm
        action={updatePartner.bind(null, partner.id)}
        initialData={partner}
        submitLabel="Salvar alterações"
        isEdit
      />
    </div>
  );
}