import Link from "next/link";

import { PartnersTable } from "@/components/partners/partners-table";
import { prisma } from "@/lib/prisma";

export default async function PartnersPage() {
  const partners = await prisma.user.findMany({
    where: {
      role: "PARTNER",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Parceiros</h1>
          <p className="mt-1 text-sm text-slate-600">
            Gerencie os parceiros comerciais cadastrados no portal.
          </p>
        </div>

        <Link
          href="/dashboard/parceiros/novo"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Novo parceiro
        </Link>
      </div>

      <PartnersTable partners={partners} />
    </div>
  );
}