import Link from "next/link";
import { notFound } from "next/navigation";

import { PartnerForm } from "@/components/partners/partner-form";
import { updatePartner } from "@/lib/actions/partners";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export default async function EditPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            Editar parceiro
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Atualize os dados comerciais do parceiro.
          </p>
        </div>

        <Link
          href={`/dashboard/parceiros/${partner.id}/usuarios`}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Equipe do parceiro
        </Link>
      </div>

      <PartnerForm
        action={updatePartner.bind(null, partner.id)}
        initialData={{
          ...partner,
          commissionPercent: Number(partner.commissionPercent),
        }}
        submitLabel="Salvar alterações"
        isEdit
      />
    </div>
  );
}
