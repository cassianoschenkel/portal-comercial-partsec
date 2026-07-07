import { AssessmentType } from "@prisma/client";

import { ASSESSMENT_TYPE_LABELS } from "@/lib/assessments/catalog";

type CustomerOption = {
  id: string;
  companyName: string;
  tradeName: string | null;
};

type Props = {
  customers: CustomerOption[];
  action: (formData: FormData) => void | Promise<void>;
};

export function AssessmentForm({ customers, action }: Props) {
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
            defaultValue=""
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
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
            Título
          </label>
          <input
            id="title"
            name="title"
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="Levantamento técnico - Partsec One"
          />
        </div>

        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-slate-700"
          >
            Tipo
          </label>
          <select
            id="type"
            name="type"
            required
            defaultValue={AssessmentType.POC}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
          >
            {Object.values(AssessmentType).map((type) => (
              <option key={type} value={type}>
                {ASSESSMENT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="validityDays"
            className="block text-sm font-medium text-slate-700"
          >
            Validade do link em dias
          </label>
          <input
            id="validityDays"
            name="validityDays"
            type="number"
            min={1}
            max={180}
            defaultValue={15}
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="internalNotes"
          className="block text-sm font-medium text-slate-700"
        >
          Observações internas
        </label>
        <textarea
          id="internalNotes"
          name="internalNotes"
          rows={4}
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Criar assessment
        </button>
      </div>
    </form>
  );
}
