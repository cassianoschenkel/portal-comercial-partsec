import Link from "next/link";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { CustomersTable } from "@/components/customers/customers-table";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CustomersPage() {
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
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Clientes</h1>
          <p className="mt-1 text-sm text-slate-600">
            Gerencie os clientes cadastrados no portal comercial.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {customers.length === 0
              ? "Nenhum cliente cadastrado"
              : `${customers.length} cliente${customers.length > 1 ? "s" : ""} cadastrado${customers.length > 1 ? "s" : ""}`}
          </p>
        </div>

        <Link
          href="/dashboard/clientes/novo"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Novo cliente
        </Link>
      </div>

      <CustomersTable customers={customers} />
    </div>
  );
}