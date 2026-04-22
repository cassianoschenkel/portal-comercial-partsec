type PartnerFormValues = {
  name?: string | null;
  email?: string | null;
  companyName?: string | null;
  phone?: string | null;
  commissionPercent?: string | number | null;
  isActive?: boolean | null;
};

type Props = {
  action: (formData: FormData) => void;
  initialData?: PartnerFormValues;
  submitLabel: string;
  isEdit?: boolean;
};

export function PartnerForm({
  action,
  initialData,
  submitLabel,
  isEdit = false,
}: Props) {
  return (
    <form action={action} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Nome
          </label>
          <input
            id="name"
            name="name"
            defaultValue={initialData?.name ?? ""}
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={initialData?.email ?? ""}
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            {isEdit ? "Nova senha (opcional)" : "Senha inicial"}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required={!isEdit}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">
            Empresa
          </label>
          <input
            id="companyName"
            name="companyName"
            defaultValue={initialData?.companyName ?? ""}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
            Telefone
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={initialData?.phone ?? ""}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="commissionPercent"
            className="block text-sm font-medium text-slate-700"
          >
            Comissão (%)
          </label>
          <input
            id="commissionPercent"
            name="commissionPercent"
            type="number"
            min={0}
            max={100}
            step="0.01"
            defaultValue={initialData?.commissionPercent ?? 30}
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          defaultChecked={Boolean(initialData?.isActive ?? true)}
          className="h-4 w-4 rounded border-slate-300"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
          Parceiro ativo
        </label>
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