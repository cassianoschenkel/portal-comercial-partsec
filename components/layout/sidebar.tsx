import Link from "next/link";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";

import { authOptions } from "@/lib/auth";

type NavItem = {
  href: string;
  label: string;
};

export async function Sidebar() {
  const session = await getServerSession(authOptions);

  const role = session?.user?.role as UserRole | undefined;

  const commonItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/clientes", label: "Clientes" },
    { href: "/dashboard/propostas", label: "Propostas" },
    { href: "/dashboard/minha-conta", label: "Minha conta" },
  ];

  const adminItems: NavItem[] =
    role === UserRole.ADMIN
      ? [
          { href: "/dashboard/parceiros", label: "Parceiros" },
          { href: "/dashboard/financeiro", label: "Financeiro" },
          { href: "/dashboard/financeiro/comissoes", label: "Comissões" },
          { href: "/dashboard/financeiro/comissoes/lotes", label: "Lotes" },
          {
            href: "/dashboard/financeiro/comissoes/relatorios",
            label: "Relatórios de Comissões",
          },
        ]
      : [];

  const teamItems: NavItem[] =
    role === UserRole.PARTNER_ADMIN || role === UserRole.PARTNER
      ? [
          { href: "/dashboard/equipe", label: "Equipe" },
          { href: "/dashboard/comissoes", label: "Comissões" },
        ]
      : [];

  const items = [...commonItems, ...adminItems, ...teamItems];

  return (
    <aside className="hidden min-h-screen w-64 border-r border-slate-200 bg-white lg:block">
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
          Partsec
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">
          Portal Comercial
        </h2>
      </div>

      <div className="px-4 py-6">
        <nav className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
