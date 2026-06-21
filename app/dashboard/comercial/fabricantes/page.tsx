import Link from "next/link";

import { VendorsTable } from "@/components/vendors/vendors-table";
import {
  getRequiredSession,
  requireCanAccessGeneralProposals,
} from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export default async function VendorsPage() {
  const session = await getRequiredSession();
  requireCanAccessGeneralProposals(session);

  const vendors = await prisma.vendor.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      websiteUrl: true,
      isActive: true,
      updatedAt: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Fabricantes</h1>
          <p className="mt-1 text-sm text-slate-600">
            Gerencie os fabricantes disponíveis para Propostas Gerais.
          </p>
        </div>
        <Link
          href="/dashboard/comercial/fabricantes/novo"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Novo fabricante
        </Link>
      </div>

      <VendorsTable vendors={vendors} />
    </div>
  );
}
