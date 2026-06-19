import Link from "next/link";
import { getServerSession } from "next-auth";

import { LogoutButton } from "@/components/layout/logout-button";
import { authOptions } from "@/lib/auth";

export async function Topbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex items-center gap-3 lg:hidden">
          <Link className="font-semibold text-slate-950" href="/">
            Partsec
          </Link>
          <Link className="text-sm text-slate-600" href="/clientes">
            Clientes
          </Link>
        </div>

        <div className="hidden text-sm text-slate-600 lg:block">
          Painel interno comercial
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/minha-conta"
            className="hidden rounded-md px-2 py-1 text-right hover:bg-slate-100 sm:block"
          >
            <p className="text-sm font-semibold text-slate-950">
              {session?.user.name}
            </p>
            <p className="text-xs text-slate-500">{session?.user.email}</p>
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
