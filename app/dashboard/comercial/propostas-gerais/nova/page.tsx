import Link from "next/link";

import { GeneralProposalForm } from "@/components/general-proposals/general-proposal-form";
import {
  getRequiredSession,
  requireCanAccessGeneralProposals,
} from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export default async function NewGeneralProposalPage() {
  const session = await getRequiredSession();
  requireCanAccessGeneralProposals(session);

  const [customers, vendors] = await Promise.all([
    prisma.customer.findMany({
      select: { id: true, companyName: true, tradeName: true },
      orderBy: { companyName: "asc" },
    }),
    prisma.vendor.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">
          Nova proposta geral
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Preencha os dados principais. Produtos e serviços serão adicionados em fases posteriores.
        </p>
      </div>

      {customers.length === 0 || vendors.length === 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="font-semibold">Não é possível criar a proposta ainda.</p>
          <p className="mt-1">
            {customers.length === 0
              ? "Cadastre ao menos um cliente. "
              : "Ative ou cadastre ao menos um fabricante. "}
          </p>
          <div className="mt-4 flex gap-3">
            {customers.length === 0 ? (
              <Link href="/dashboard/clientes/novo" className="font-semibold underline">Cadastrar cliente</Link>
            ) : null}
            {vendors.length === 0 ? (
              <Link href="/dashboard/comercial/fabricantes" className="font-semibold underline">Gerenciar fabricantes</Link>
            ) : null}
          </div>
        </div>
      ) : (
        <GeneralProposalForm
          customers={customers.map((customer) => ({
            id: customer.id,
            name: customer.tradeName
              ? `${customer.companyName} (${customer.tradeName})`
              : customer.companyName,
          }))}
          vendors={vendors}
        />
      )}
    </div>
  );
}
