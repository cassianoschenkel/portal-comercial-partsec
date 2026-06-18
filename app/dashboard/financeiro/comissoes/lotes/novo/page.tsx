import Link from "next/link";

import { CommissionActionForm } from "@/components/commissions/commission-action-form";
import { createCommissionBatch } from "@/lib/actions/commission-batches";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

function currentMonthStart() {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default async function NewCommissionBatchPage() {
  await requireAdmin();

  const partners = await prisma.partner.findMany({
    orderBy: { companyName: "asc" },
    select: { id: true, companyName: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">
          Novo lote de comissões
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Agrupe comissões pendentes de um parceiro em um fechamento.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <CommissionActionForm
          action={createCommissionBatch}
          submitLabel="Criar lote"
          pendingLabel="Criando..."
          variant="primary"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="partnerId"
                className="block text-sm font-medium text-slate-700"
              >
                Parceiro
              </label>
              <select
                id="partnerId"
                name="partnerId"
                required
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
              >
                <option value="">Selecione</option>
                {partners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.companyName || partner.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="periodStart"
                className="block text-sm font-medium text-slate-700"
              >
                Início do período
              </label>
              <input
                id="periodStart"
                name="periodStart"
                type="date"
                required
                defaultValue={currentMonthStart()}
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label
                htmlFor="periodEnd"
                className="block text-sm font-medium text-slate-700"
              >
                Fim do período
              </label>
              <input
                id="periodEnd"
                name="periodEnd"
                type="date"
                required
                defaultValue={today()}
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-slate-700"
              >
                Observação
              </label>
              <input
                id="notes"
                name="notes"
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </div>
          </div>
        </CommissionActionForm>

        <div className="mt-6">
          <Link
            href="/dashboard/financeiro/comissoes/lotes"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Voltar
          </Link>
        </div>
      </div>
    </div>
  );
}
