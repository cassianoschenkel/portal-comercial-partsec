import { Customer, ProposalPlan } from "@prisma/client";

type Props = {
  customers: Pick<Customer, "id" | "companyName" | "tradeName">[];
  action: (formData: FormData) => void;
};

export function ProposalForm({ customers, action }: Props) {
  return (
    <form
      action={action}
      className="space-y-6 rounded-lg border border-slate-200 bg-white p-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="customerId"
            className="block text-sm font-medium text-slate-700"
          >
            Cliente
          </label>
          <select
            id="customerId"
            name="customerId"
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            defaultValue=""
          >
            <option value="" disabled>
              Selecione um cliente
            </option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.companyName}
                {customer.tradeName ? ` (${customer.tradeName})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-slate-700"
          >
            Título da proposta
          </label>
          <input
            id="title"
            name="title"
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="Proposta Partsec One - Cliente X"
          />
        </div>

        <div>
          <label
            htmlFor="plan"
            className="block text-sm font-medium text-slate-700"
          >
            Plano
          </label>
          <select
            id="plan"
            name="plan"
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            defaultValue={ProposalPlan.ESSENTIAL}
          >
            <option value={ProposalPlan.ESSENTIAL}>Essential</option>
            <option value={ProposalPlan.PROFESSIONAL}>Professional</option>
            <option value={ProposalPlan.ENTERPRISE}>Enterprise</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="activeCount"
            className="block text-sm font-medium text-slate-700"
          >
            Quantidade de ativos
          </label>
          <input
            id="activeCount"
            name="activeCount"
            type="number"
            min={1}
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="100"
          />
        </div>

        <div>
          <label
            htmlFor="discountPercent"
            className="block text-sm font-medium text-slate-700"
          >
            Desconto (%)
          </label>
          <input
            id="discountPercent"
            name="discountPercent"
            type="number"
            min={0}
            max={20}
            step="0.01"
            defaultValue={0}
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="scopeDescription"
          className="block text-sm font-medium text-slate-700"
        >
          Escopo desta proposta
        </label>
        <textarea
          id="scopeDescription"
          name="scopeDescription"
          className="mt-2 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2"
          placeholder="Descreva de forma objetiva o escopo específico desta proposta para o cliente."
        />
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-slate-700"
        >
          Observações
        </label>
        <textarea
          id="notes"
          name="notes"
          className="mt-2 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Gerar proposta
        </button>
      </div>
    </form>
  );
}