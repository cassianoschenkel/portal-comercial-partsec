import Link from "next/link";

import { CommissionActionForm } from "@/components/commissions/commission-action-form";
import { createCommissionStatement } from "@/lib/actions/commission-statements";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function firstDayOfCurrentMonth() {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().slice(0, 10);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default async function NewCommissionStatementPage() {
  await requireAdmin();

  const partners = await prisma.partner.findMany({
    orderBy: { companyName: "asc" },
    select: { id: true, companyName: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            Novo relatório de comissões
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Gere um relatório mensal apenas com comissões liberadas para faturamento.
          </p>
        </div>

        <Link
          href="/dashboard/financeiro/comissoes/relatorios"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Voltar
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <CommissionActionForm
          action={createCommissionStatement}
          submitLabel="Gerar relatório"
          pendingLabel="Gerando..."
          variant="primary"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="partnerId" className="block text-sm font-medium text-slate-700">
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
              <label htmlFor="referenceMonth" className="block text-sm font-medium text-slate-700">
                Mês de referência
              </label>
              <input
                id="referenceMonth"
                name="referenceMonth"
                type="month"
                required
                defaultValue={currentMonth()}
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="periodStart" className="block text-sm font-medium text-slate-700">
                Período inicial
              </label>
              <input
                id="periodStart"
                name="periodStart"
                type="date"
                required
                defaultValue={firstDayOfCurrentMonth()}
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="periodEnd" className="block text-sm font-medium text-slate-700">
                Período final
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

            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
                Observação
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                placeholder="Observações internas sobre o relatório"
              />
            </div>
          </div>
        </CommissionActionForm>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm text-slate-600">
          O relatório considera a data de liberação da comissão e inclui somente
          comissões pendentes, liberadas, não pagas, não canceladas e ainda sem
          relatório mensal.
        </p>
      </div>
    </div>
  );
}
