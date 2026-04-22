type CustomerFormValues = {
  companyName?: string | null;
  tradeName?: string | null;
  document?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  notes?: string | null;
};

type Props = {
  action: (formData: FormData) => void;
  initialData?: CustomerFormValues;
  submitLabel: string;
};

export function CustomerForm({ action, initialData, submitLabel }: Props) {
  return (
    <form action={action} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">
            Razão social
          </label>
          <input
            id="companyName"
            name="companyName"
            defaultValue={initialData?.companyName ?? ""}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label htmlFor="tradeName" className="block text-sm font-medium text-slate-700">
            Nome fantasia
          </label>
          <input
            id="tradeName"
            name="tradeName"
            defaultValue={initialData?.tradeName ?? ""}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="document" className="block text-sm font-medium text-slate-700">
            Documento
          </label>
          <input
            id="document"
            name="document"
            defaultValue={initialData?.document ?? ""}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label htmlFor="contactName" className="block text-sm font-medium text-slate-700">
            Nome do contato
          </label>
          <input
            id="contactName"
            name="contactName"
            defaultValue={initialData?.contactName ?? ""}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-slate-700">
            E-mail
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={initialData?.contactEmail ?? ""}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label htmlFor="contactPhone" className="block text-sm font-medium text-slate-700">
            Telefone
          </label>
          <input
            id="contactPhone"
            name="contactPhone"
            defaultValue={initialData?.contactPhone ?? ""}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
          Observações
        </label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={initialData?.notes ?? ""}
          className="mt-2 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
