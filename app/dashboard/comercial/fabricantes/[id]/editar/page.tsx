import { notFound } from "next/navigation";

import { VendorForm } from "@/components/vendors/vendor-form";
import { updateVendor } from "@/lib/actions/vendors";
import {
  getRequiredSession,
  requireCanAccessGeneralProposals,
} from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export default async function EditVendorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getRequiredSession();
  requireCanAccessGeneralProposals(session);
  const { id } = await params;

  const vendor = await prisma.vendor.findUnique({
    where: { id },
  });

  if (!vendor) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">
          Editar fabricante
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Atualize os dados internos de {vendor.name}.
        </p>
      </div>

      <VendorForm
        action={updateVendor.bind(null, vendor.id)}
        initialData={vendor}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}
