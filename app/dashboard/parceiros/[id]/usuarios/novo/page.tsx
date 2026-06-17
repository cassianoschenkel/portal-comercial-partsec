import { notFound } from "next/navigation";

import { PartnerUserForm } from "@/components/partners/partner-user-form";
import { createPartnerUser } from "@/lib/actions/partner-users";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export default async function NewPartnerUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const partner = await prisma.partner.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      companyName: true,
    },
  });

  if (!partner) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">
          Novo usuário do parceiro
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Crie um acesso para a equipe de {partner.companyName || partner.name}.
        </p>
      </div>

      <PartnerUserForm
        action={createPartnerUser.bind(null, partner.id)}
        backHref={`/dashboard/parceiros/${partner.id}/usuarios`}
        submitLabel="Salvar usuário"
      />
    </div>
  );
}
