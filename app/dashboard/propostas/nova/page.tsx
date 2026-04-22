import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { ProposalForm } from "@/components/proposals/proposal-form";
import { createProposal } from "@/lib/actions/proposals";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function NewProposalPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.role) {
    redirect("/login");
  }

  const customers = await prisma.customer.findMany({
    where:
      session.user.role === UserRole.ADMIN
        ? {}
        : {
            partnerId: session.user.id,
          },
    select: {
      id: true,
      companyName: true,
      tradeName: true,
    },
    orderBy: {
      companyName: "asc",
    },
  });

  if (customers.length === 0) {
    redirect("/dashboard/clientes/novo");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Nova proposta</h1>
        <p className="mt-1 text-sm text-slate-600">
          Gere uma proposta comercial com cálculo automático.
        </p>
      </div>

      <ProposalForm customers={customers} action={createProposal} />
    </div>
  );
}